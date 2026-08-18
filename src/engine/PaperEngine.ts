import { Book, ReaderSettings } from '../types';
import {
  BookSpreadState,
  CurlParams,
  EngineDebugInfo,
  GestureState,
  QualityLevel,
  TurnDirection,
} from './types';
import { QUALITY_CONFIGS } from './PageCurlPhysics';
import { PageTextureManager } from './PageTextureManager';
import { WebGLPaperRenderer } from './WebGLPaperRenderer';
import { CanvasPaperRenderer } from './CanvasPaperRenderer';
import { GestureStateMachine } from './GestureStateMachine';
import { soundEngine } from '../utils/audioSynthesizer';

export interface PaperEngineConfig {
  canvas: HTMLCanvasElement;
  book: Book;
  settings: ReaderSettings;
  isSpreadMode: boolean;
  qualityLevel?: QualityLevel;
  onPageChange: (newPage: number) => void;
  onStateChange?: (state: GestureState) => void;
}

export class PaperEngine {
  private canvas: HTMLCanvasElement;
  private book: Book;
  private settings: ReaderSettings;
  private isSpreadMode: boolean;
  private quality: QualityLevel = 'HIGH';

  private webglRenderer: WebGLPaperRenderer | null = null;
  private canvasRenderer: CanvasPaperRenderer | null = null;
  private textureManager: PageTextureManager;
  private gestureStateMachine: GestureStateMachine;

  private spreadState: BookSpreadState;
  private curlParams: CurlParams;

  private animFrameId: number | null = null;
  private isRunning: boolean = false;
  private lastFrameTime: number = performance.now();

  // Performance telemetry
  private fps: number = 60;
  private frameCount: number = 0;
  private lastFpsUpdate: number = performance.now();
  private lastCreasePoints: [number, number, number, number] = [1, 0, 1, 1];
  private lastStretchError: number = 0.0004;
  private lastSpineError: number = 0;
  private lastMaxDisplacement: number = 0;
  private lastTriangleDistortion: number = 1.0;
  private lastInvalidCount: number = 0;

  private onPageChange: (newPage: number) => void;
  private onStateChange?: (state: GestureState) => void;

  constructor(config: PaperEngineConfig) {
    this.canvas = config.canvas;
    this.book = config.book;
    this.settings = config.settings;
    this.isSpreadMode = config.isSpreadMode;
    this.quality = config.qualityLevel || 'HIGH';
    this.onPageChange = config.onPageChange;
    this.onStateChange = config.onStateChange;

    const qConfig = QUALITY_CONFIGS[this.quality];

    // Initialize WebGL Renderer
    try {
      this.webglRenderer = new WebGLPaperRenderer(this.canvas, qConfig);
      if (!this.webglRenderer.getGL()) {
        this.webglRenderer = null;
        this.canvasRenderer = new CanvasPaperRenderer(this.canvas);
      }
    } catch {
      this.webglRenderer = null;
      this.canvasRenderer = new CanvasPaperRenderer(this.canvas);
    }

    // Initialize Texture Manager with GL context
    this.textureManager = new PageTextureManager(this.webglRenderer?.getGL());
    this.textureManager.setBookAndSettings(this.book, this.settings);

    // Initialize Initial Spread State
    this.spreadState = this.computeSpreadState(this.book.currentPage);

    // Initial Curl Params (Flat)
    this.curlParams = {
      progress: 0,
      grabPoint: { x: 1, y: 0.8 },
      currentPoint: { x: 1, y: 0.8 },
      direction: 'forward',
      curlAngle: 0,
      curlRadius: 0.15,
      spineTension: 1.0,
      foldOffset: 0,
    };

    // Initialize Gesture State Machine
    this.gestureStateMachine = new GestureStateMachine(
      {
        onStateChange: (state) => {
          this.onStateChange?.(state);
        },
        onUpdateParams: (params) => {
          this.curlParams = params;
        },
        onTurnStart: (direction) => {
          return this.handleTurnStart(direction);
        },
        onTurnCommit: (direction) => {
          this.handleTurnCommit(direction);
        },
        onTurnCancel: (direction) => {
          this.handleTurnCancel(direction);
        },
        onPlaySound: (type) => {
          if (this.settings.soundEffects) {
            if (type === 'peel') soundEngine.playPagePeelSound();
            else if (type === 'flip') soundEngine.playPageTurnSound(1.1);
            else if (type === 'settle') soundEngine.playPageSettleSound();
          }
        },
      },
      this.isSpreadMode
    );

    this.gestureStateMachine.attach(this.canvas);

    // Preload current page range
    this.preloadCurrentSpread();

    // Start Rendering Loop
    this.start();
  }

  public setSpreadMode(isSpread: boolean) {
    this.isSpreadMode = isSpread;
    this.gestureStateMachine.setSpreadMode(isSpread);
    this.spreadState = this.computeSpreadState(this.book.currentPage);
    this.preloadCurrentSpread();
  }

  public setQuality(quality: QualityLevel) {
    this.quality = quality;
    if (this.webglRenderer) {
      this.webglRenderer.setQuality(QUALITY_CONFIGS[quality]);
    }
  }

  public updateBookAndSettings(book: Book, settings: ReaderSettings) {
    this.book = book;
    this.settings = settings;
    this.textureManager.setBookAndSettings(book, settings);
    this.spreadState = this.computeSpreadState(book.currentPage);
    this.preloadCurrentSpread();
  }

  public resize(width: number, height: number) {
    const qConfig = QUALITY_CONFIGS[this.quality];
    const dpr = Math.min(qConfig.dprClamp, window.devicePixelRatio || 1.5);

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    const pageW = this.isSpreadMode ? width * 0.5 : width;
    this.textureManager.setDimensions(pageW, height, qConfig.dprClamp);
  }

  public triggerAutoTurn(direction: TurnDirection) {
    this.gestureStateMachine.triggerAutoTurn(direction);
  }

  private handleTurnStart(direction: TurnDirection): boolean {
    const cur = this.book.currentPage;
    if (direction === 'forward') {
      if (this.isSpreadMode) {
        if (cur >= this.book.totalPages - 1) return false;
      } else {
        if (cur >= this.book.totalPages) return false;
      }
    } else {
      if (cur <= 1) return false;
    }

    this.spreadState = this.computeSpreadState(cur);
    return true;
  }

  private handleTurnCommit(direction: TurnDirection) {
    let newPage = this.book.currentPage;
    const step = this.isSpreadMode ? 2 : 1;

    if (direction === 'forward') {
      newPage = Math.min(this.book.totalPages, this.book.currentPage + step);
    } else {
      newPage = Math.max(1, this.book.currentPage - step);
    }

    this.onPageChange(newPage);
    this.spreadState = this.computeSpreadState(newPage);
    this.preloadCurrentSpread();
  }

  private handleTurnCancel(direction: TurnDirection) {
    this.spreadState = this.computeSpreadState(this.book.currentPage);
  }

  private computeSpreadState(currentPage: number): BookSpreadState {
    const total = this.book.totalPages;

    if (!this.isSpreadMode) {
      // Single Page Mode
      return {
        currentLogicalPage: currentPage,
        totalPages: total,
        leftPageNumber: Math.max(1, currentPage - 1),
        rightPageNumber: currentPage,
        turningPageNumber: currentPage,
        turningBackPageNumber: Math.min(total, currentPage + 1),
        nextLeftPageNumber: Math.max(1, currentPage - 1),
        nextRightPageNumber: Math.min(total, currentPage + 1),
        isSpreadMode: false,
      };
    }

    // Spread Mode (Book with Left and Right Pages)
    // Page 1 is Cover (shown on right side or solo)
    let left = 0;
    let right = 0;

    if (currentPage === 1) {
      left = 0;
      right = 1;
    } else {
      // Even page is on Left, Odd page is on Right
      left = currentPage % 2 === 0 ? currentPage : currentPage - 1;
      right = left + 1 <= total ? left + 1 : 0;
    }

    return {
      currentLogicalPage: currentPage,
      totalPages: total,
      leftPageNumber: left,
      rightPageNumber: right,
      turningPageNumber: right,
      turningBackPageNumber: right + 1 <= total ? right + 1 : 0,
      nextLeftPageNumber: left > 2 ? left - 2 : 0,
      nextRightPageNumber: right + 2 <= total ? right + 2 : 0,
      isSpreadMode: true,
    };
  }

  private preloadCurrentSpread() {
    const cur = this.book.currentPage;
    this.textureManager.preloadRange(cur - 3, cur + 4);
  }

  private start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.renderLoop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private renderLoop = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Update Gesture physics
    this.gestureStateMachine.update(dt);

    // Render Scene
    const w = this.canvas.width;
    const h = this.canvas.height;

    if (this.webglRenderer && w > 0 && h > 0) {
      const res = this.webglRenderer.renderScene(
        this.spreadState,
        this.curlParams,
        this.textureManager,
        w,
        h
      );
      this.lastCreasePoints = res.creasePoints;
      if (res.deformation) {
        this.lastStretchError = res.deformation.stretchError;
        this.lastSpineError = res.deformation.spineError;
        this.lastMaxDisplacement = res.deformation.maxDisplacement;
        this.lastTriangleDistortion = res.deformation.triangleDistortion;
        this.lastInvalidCount = res.deformation.invalidCount;
      }
    } else if (this.canvasRenderer && w > 0 && h > 0) {
      this.canvasRenderer.renderScene(
        this.spreadState,
        this.curlParams,
        this.textureManager,
        w,
        h
      );
    }

    // Telemetry
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    this.animFrameId = requestAnimationFrame(this.renderLoop);
  };

  public getDebugInfo(): EngineDebugInfo {
    const qConfig = QUALITY_CONFIGS[this.quality];
    let healthStatus: 'valid' | 'warning' | 'invalid' = 'valid';
    if (this.lastInvalidCount > 0 || this.lastStretchError > 0.05) {
      healthStatus = 'invalid';
    } else if (this.lastStretchError > 0.02 || this.lastSpineError > 0.01) {
      healthStatus = 'warning';
    }

    return {
      fps: this.fps,
      frameTimeMs: Math.round(1000 / Math.max(1, this.fps)),
      renderMode: this.webglRenderer ? 'webgl2' : 'canvas2d',
      quality: this.quality,
      meshRes: `${qConfig.gridX}x${qConfig.gridY} (${(qConfig.gridX + 1) * (qConfig.gridY + 1)} verts)`,
      gestureState: this.gestureStateMachine.getState(),
      turnDirection: this.gestureStateMachine.getDirection(),
      progress: Math.round(this.curlParams.progress * 100) / 100,
      velocity: Math.round(this.gestureStateMachine.getVelocity() * 100) / 100,
      curlRadius: Math.round(this.curlParams.curlRadius * 1000) / 1000,
      curlAngleDeg: Math.round((this.curlParams.curlAngle * 180) / Math.PI),
      grabPoint: this.gestureStateMachine.getGrabPoint(),
      currentPointer: this.gestureStateMachine.getCurrentPoint(),
      creaseLine: {
        x1: Math.round(this.lastCreasePoints[0] * 100) / 100,
        y1: Math.round(this.lastCreasePoints[1] * 100) / 100,
        x2: Math.round(this.lastCreasePoints[2] * 100) / 100,
        y2: Math.round(this.lastCreasePoints[3] * 100) / 100,
      },
      texturesLoaded: this.book.totalPages,
      stretchError: this.lastStretchError,
      spineError: this.lastSpineError,
      maxDisplacement: this.lastMaxDisplacement,
      triangleDistortion: this.lastTriangleDistortion,
      invalidVertexCount: this.lastInvalidCount,
      meshHealthStatus: healthStatus,
    };
  }

  public dispose() {
    this.stop();
    this.gestureStateMachine.detach();
    this.textureManager.dispose();
    this.webglRenderer?.dispose();
  }
}
