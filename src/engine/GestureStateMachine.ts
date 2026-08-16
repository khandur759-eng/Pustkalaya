import { GestureState, TurnDirection, GrabPosition, CurlParams } from './types';

export interface GestureCallbacks {
  onStateChange: (state: GestureState) => void;
  onUpdateParams: (params: CurlParams) => void;
  onTurnStart: (direction: TurnDirection) => boolean; // returns false if navigation is blocked
  onTurnCommit: (direction: TurnDirection) => void;
  onTurnCancel: (direction: TurnDirection) => void;
  onPlaySound?: (type: 'peel' | 'flip' | 'settle') => void;
}

export class GestureStateMachine {
  private state: GestureState = 'IDLE';
  private direction: TurnDirection = 'forward';
  private grabPoint: { x: number; y: number } = { x: 1, y: 0.8 };
  private currentPoint: { x: number; y: number } = { x: 1, y: 0.8 };
  private progress: number = 0;
  private velocityX: number = 0;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;
  private lastTimestamp: number = 0;
  private settleStartTime: number = 0;
  private settleStartProgress: number = 0;
  private settleTargetProgress: number = 0;
  private settleDuration: number = 320;
  private isPointerDown: boolean = false;
  private pointerId: number | null = null;
  private boundElement: HTMLElement | null = null;
  private isSpreadMode: boolean = true;
  private callbacks: GestureCallbacks;

  // Velocity history smoothing
  private velocityHistory: Array<{ vx: number; time: number }> = [];

  constructor(callbacks: GestureCallbacks, isSpreadMode: boolean = true) {
    this.callbacks = callbacks;
    this.isSpreadMode = isSpreadMode;
  }

  public setSpreadMode(isSpread: boolean) {
    this.isSpreadMode = isSpread;
  }

  public getState(): GestureState {
    return this.state;
  }

  public getProgress(): number {
    return this.progress;
  }

  public getDirection(): TurnDirection {
    return this.direction;
  }

  public getVelocity(): number {
    return this.velocityX;
  }

  public getGrabPoint() {
    return { ...this.grabPoint };
  }

  public getCurrentPoint() {
    return { ...this.currentPoint };
  }

  public attach(element: HTMLElement) {
    this.detach();
    this.boundElement = element;

    element.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
    window.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    window.addEventListener('pointerup', this.handlePointerUp, { passive: false });
    window.addEventListener('pointercancel', this.handlePointerCancel, { passive: false });
  }

  public detach() {
    if (this.boundElement) {
      this.boundElement.removeEventListener('pointerdown', this.handlePointerDown);
      this.boundElement = null;
    }
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerCancel);
  }

  public update(deltaTimeMs: number) {
    if (this.state === 'SETTLING_FORWARD' || this.state === 'SETTLING_BACKWARD') {
      const now = performance.now();
      const elapsed = now - this.settleStartTime;
      const t = Math.min(1.0, elapsed / Math.max(1, this.settleDuration));

      // Natural ease-out cubic deceleration
      const easedT = 1 - Math.pow(1 - t, 3);
      this.progress = this.settleStartProgress + (this.settleTargetProgress - this.settleStartProgress) * easedT;

      // Animate current point moving smoothly with progress
      const targetX = this.state === 'SETTLING_FORWARD' ? -0.1 : 1.1;
      this.currentPoint.x = this.grabPoint.x + (targetX - this.grabPoint.x) * easedT;

      this.emitParams();

      if (t >= 1.0) {
        if (this.state === 'SETTLING_FORWARD') {
          this.progress = 1.0;
          this.setState('COMPLETED');
          this.callbacks.onPlaySound?.('settle');
          this.callbacks.onTurnCommit(this.direction);
        } else {
          this.progress = 0.0;
          this.setState('CANCELLED');
          this.callbacks.onTurnCancel(this.direction);
        }
        this.setState('IDLE');
        this.progress = 0.0;
        this.emitParams();
      }
    }
  }

  private setState(newState: GestureState) {
    if (this.state === newState) return;
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  private handlePointerDown = (e: PointerEvent) => {
    // Ignore interactive UI buttons, inputs, links
    if ((e.target as HTMLElement).closest('button, input, a, select, textarea, [data-interactive="true"]')) {
      return;
    }

    if (!this.boundElement) return;
    const rect = this.boundElement.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    // Interruptibility: if already settling, seamlessly capture current progress
    if (this.state === 'SETTLING_FORWARD' || this.state === 'SETTLING_BACKWARD') {
      this.isPointerDown = true;
      this.pointerId = e.pointerId;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.lastTimestamp = performance.now();
      this.setState('DRAGGING');
      this.callbacks.onPlaySound?.('peel');
      e.preventDefault();
      return;
    }

    // Determine candidate direction and grab area
    let candidateDir: TurnDirection | null = null;
    let normalizedGrabX = 1.0;
    let normalizedGrabY = Math.max(0.05, Math.min(0.95, relY));

    if (this.isSpreadMode) {
      // In spread mode: right page occupies relX in [0.5, 1.0], left page in [0.0, 0.5]
      if (relX >= 0.55) {
        candidateDir = 'forward';
        // Page-relative x [0..1] on the right page
        normalizedGrabX = (relX - 0.5) * 2.0;
      } else if (relX <= 0.45) {
        candidateDir = 'backward';
        // Page-relative x [0..1] on the left page (1 = outer left edge, 0 = spine)
        normalizedGrabX = (0.5 - relX) * 2.0;
      }
    } else {
      // In single page mode
      if (relX >= 0.6) {
        candidateDir = 'forward';
        normalizedGrabX = relX;
      } else if (relX <= 0.4) {
        candidateDir = 'backward';
        normalizedGrabX = 1.0 - relX;
      }
    }

    if (!candidateDir) return;

    // Ask transaction callback if navigation is allowed (e.g. not on page 1 for backward, not on last page for forward)
    const allowed = this.callbacks.onTurnStart(candidateDir);
    if (!allowed) return;

    this.isPointerDown = true;
    this.pointerId = e.pointerId;
    this.direction = candidateDir;
    this.grabPoint = { x: normalizedGrabX, y: normalizedGrabY };
    this.currentPoint = { x: normalizedGrabX, y: normalizedGrabY };
    this.progress = 0.0;
    this.velocityX = 0;
    this.velocityHistory = [];
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.lastTimestamp = performance.now();

    this.setState('GRABBED');
    this.callbacks.onPlaySound?.('peel');
    e.preventDefault();
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown || !this.boundElement) return;

    const now = performance.now();
    const dt = Math.max(1, now - this.lastTimestamp);
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;

    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.lastTimestamp = now;

    // Track smoothed instantaneous velocity (px / ms)
    const instVx = dx / dt;
    this.velocityHistory.push({ vx: instVx, time: now });
    if (this.velocityHistory.length > 5) {
      this.velocityHistory.shift();
    }
    this.velocityX = this.velocityHistory.reduce((sum, item) => sum + item.vx, 0) / this.velocityHistory.length;

    const rect = this.boundElement.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = Math.max(0.02, Math.min(0.98, (e.clientY - rect.top) / rect.height));

    const halfWidth = this.isSpreadMode ? rect.width * 0.5 : rect.width;

    if (this.direction === 'forward') {
      // Pulling from right to left
      const startX = this.isSpreadMode ? rect.left + rect.width * 0.5 + this.grabPoint.x * halfWidth : rect.left + this.grabPoint.x * rect.width;
      const dragDist = startX - e.clientX;
      this.progress = Math.max(0.0, Math.min(1.0, dragDist / halfWidth));

      const pageRelX = (e.clientX - (rect.left + (this.isSpreadMode ? halfWidth : 0))) / halfWidth;
      this.currentPoint = { x: pageRelX, y: relY };
    } else {
      // Pulling from left to right
      const startX = this.isSpreadMode ? rect.left + (1.0 - this.grabPoint.x) * halfWidth : rect.left + (1.0 - this.grabPoint.x) * rect.width;
      const dragDist = e.clientX - startX;
      this.progress = Math.max(0.0, Math.min(1.0, dragDist / halfWidth));

      const pageRelX = ((rect.left + (this.isSpreadMode ? halfWidth : rect.width)) - e.clientX) / halfWidth;
      this.currentPoint = { x: pageRelX, y: relY };
    }

    if (this.progress > 0.01 && this.state !== 'DRAGGING') {
      this.setState('DRAGGING');
    }

    this.emitParams();
    e.preventDefault();
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    this.pointerId = null;

    this.resolveRelease();
  };

  private handlePointerCancel = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    this.pointerId = null;

    this.triggerSettling('backward');
  };

  private resolveRelease() {
    this.setState('RELEASED');

    // Calculate physical turn intent based on progress AND velocity vector
    // Forward turn: negative pointer velocity (moving left) or positive progress favors completing
    // Backward turn: positive pointer velocity (moving right) favors completing
    const isForward = this.direction === 'forward';
    const favorsTurnVelocity = isForward ? this.velocityX < -0.28 : this.velocityX > 0.28;
    const opposesTurnVelocity = isForward ? this.velocityX > 0.28 : this.velocityX < -0.28;

    let shouldComplete = false;

    if (favorsTurnVelocity) {
      // Strong flick in the direction of the turn
      shouldComplete = true;
    } else if (opposesTurnVelocity) {
      // User flicked back towards origin
      shouldComplete = false;
    } else {
      // Distance threshold: if dragged past 28% of the page width, complete turn
      shouldComplete = this.progress >= 0.28;
    }

    // Pass instantaneous release speed into settling duration calculation for organic inertia
    const releaseSpeed = Math.abs(this.velocityX);
    const targetProgress = shouldComplete ? 1.0 : 0.0;
    const remainingDist = Math.abs(targetProgress - this.progress);
    
    // Duration scales with remaining distance and speed (fast flick = 200ms, slow drag = 380ms)
    const dynamicDuration = Math.max(180, Math.min(440, (remainingDist * 360) / Math.max(0.7, releaseSpeed * 1.5)));

    this.triggerSettling(shouldComplete ? 'forward' : 'backward', dynamicDuration);
  }

  public triggerSettling(direction: 'forward' | 'backward', customDurationMs?: number) {
    this.settleStartTime = performance.now();
    this.settleStartProgress = this.progress;
    this.settleTargetProgress = direction === 'forward' ? 1.0 : 0.0;

    const remainingDist = Math.abs(this.settleTargetProgress - this.settleStartProgress);
    this.settleDuration = customDurationMs || Math.max(180, Math.min(420, remainingDist * 360));

    this.setState(direction === 'forward' ? 'SETTLING_FORWARD' : 'SETTLING_BACKWARD');
  }

  /**
   * Programmatically trigger a smooth page turn (e.g. from keyboard arrow or button).
   */
  public triggerAutoTurn(direction: TurnDirection, durationMs: number = 480) {
    if (this.state !== 'IDLE') return;

    const allowed = this.callbacks.onTurnStart(direction);
    if (!allowed) return;

    this.direction = direction;
    this.grabPoint = { x: 1.0, y: 0.85 };
    this.currentPoint = { x: 1.0, y: 0.85 };
    this.progress = 0.0;
    this.callbacks.onPlaySound?.('flip');

    this.triggerSettling('forward', durationMs);
  }

  private emitParams() {
    const params: CurlParams = {
      progress: this.progress,
      grabPoint: { ...this.grabPoint },
      currentPoint: { ...this.currentPoint },
      direction: this.direction,
      curlAngle: 0,
      curlRadius: 0.15,
      spineTension: 1.0,
      foldOffset: 0,
    };
    this.callbacks.onUpdateParams(params);
  }
}
