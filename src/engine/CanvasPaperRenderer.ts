import { BookSpreadState, CurlParams } from './types';
import { PageTextureManager } from './PageTextureManager';

export class CanvasPaperRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
  }

  public renderScene(
    spreadState: BookSpreadState,
    curlParams: CurlParams,
    textureMgr: PageTextureManager,
    viewportW: number,
    viewportH: number
  ) {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, viewportW, viewportH);

    const isSpread = spreadState.isSpreadMode;
    const halfW = isSpread ? viewportW * 0.5 : viewportW;
    const pageH = viewportH;

    // 1. Render Left Page
    const underneathLeft = curlParams.progress > 0.01 && curlParams.direction === 'backward'
      ? spreadState.nextLeftPageNumber
      : spreadState.leftPageNumber;

    if (isSpread && underneathLeft > 0) {
      const leftTex = textureMgr.getTexture(underneathLeft);
      if (leftTex.canvas) {
        ctx.drawImage(leftTex.canvas, 0, 0, halfW, pageH);
      }
    }

    // 2. Render Destination Page Underneath Right Side
    const underneathRight = curlParams.progress > 0.01 && curlParams.direction === 'forward'
      ? spreadState.nextRightPageNumber
      : spreadState.rightPageNumber;

    if (underneathRight > 0) {
      const rightTex = textureMgr.getTexture(underneathRight);
      const rightX = isSpread ? halfW : 0;
      if (rightTex.canvas) {
        ctx.drawImage(rightTex.canvas, rightX, 0, halfW, pageH);
      }
    }

    // 3. Render Turning Page Peel & Curl in Canvas 2D
    if (curlParams.progress > 0.001) {
      const isForward = curlParams.direction === 'forward';
      const frontNum = isForward ? spreadState.rightPageNumber : spreadState.leftPageNumber;
      const backNum = isForward
        ? (spreadState.rightPageNumber + 1 <= spreadState.totalPages ? spreadState.rightPageNumber + 1 : 0)
        : (spreadState.leftPageNumber > 1 ? spreadState.leftPageNumber - 1 : 1);

      const frontTex = frontNum > 0 ? textureMgr.getTexture(frontNum) : null;
      const backTex = backNum > 0 ? textureMgr.getTexture(backNum) : null;

      const p = curlParams.progress;
      const rightX = isSpread ? halfW : 0;

      // Draw peeling sheet
      ctx.save();
      if (isForward) {
        // Turning from right to left
        const peelW = halfW * (1.0 - p);
        if (frontTex.canvas && peelW > 2) {
          ctx.drawImage(
            frontTex.canvas,
            0,
            0,
            (frontTex.width * (1.0 - p)),
            frontTex.height,
            rightX,
            0,
            peelW,
            pageH
          );
        }

        // Draw curved backside
        if (backTex.canvas && p > 0.1) {
          const backW = halfW * p;
          ctx.drawImage(
            backTex.canvas,
            backTex.width * (1.0 - p),
            0,
            backTex.width * p,
            backTex.height,
            rightX + peelW - backW * 0.2,
            0,
            backW * 0.8,
            pageH
          );
        }

        // Dynamic gradient shadow on the fold edge
        const grad = ctx.createLinearGradient(rightX + peelW - 30, 0, rightX + peelW + 30, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0.3)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(rightX + peelW - 30, 0, 60, pageH);
      } else {
        // Turning backward from left to right
        const peelW = halfW * p;
        if (backTex.canvas && peelW > 2) {
          ctx.drawImage(
            backTex.canvas,
            0,
            0,
            backTex.width * p,
            backTex.height,
            halfW - peelW,
            0,
            peelW,
            pageH
          );
        }
      }
      ctx.restore();
    }

    // 4. Center Spine Gutter Shading
    if (isSpread) {
      const spineGrad = ctx.createLinearGradient(halfW - 24, 0, halfW + 24, 0);
      spineGrad.addColorStop(0, 'rgba(0,0,0,0)');
      spineGrad.addColorStop(0.5, 'rgba(0,0,0,0.22)');
      spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = spineGrad;
      ctx.fillRect(halfW - 24, 0, 48, pageH);
    }
  }
}
