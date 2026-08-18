import { Book, PageData, ReaderSettings, Chapter } from '../types';
import { PageTextureInfo } from './types';

export class PageTextureManager {
  private cache: Map<number, PageTextureInfo> = new Map();
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private currentBook: Book | null = null;
  private currentSettings: ReaderSettings | null = null;
  private pageAspect: number = 1.45; // Height / Width
  private baseWidth: number = 720;
  private dpr: number = 1.5;

  constructor(gl?: WebGLRenderingContext | WebGL2RenderingContext | null) {
    this.gl = gl || null;
    this.dpr = typeof window !== 'undefined' ? Math.min(2.0, window.devicePixelRatio || 1.5) : 1.5;
  }

  public setGL(gl: WebGLRenderingContext | WebGL2RenderingContext | null) {
    this.gl = gl;
    // Recreate WebGL textures if GL context changed
    this.cache.forEach((info) => {
      if (this.gl && info.canvas) {
        info.glTexture = this.createGLTexture(info.canvas);
      }
    });
  }

  public setDimensions(width: number, height: number, dprClamp: number = 2.0) {
    this.dpr = Math.min(dprClamp, typeof window !== 'undefined' ? window.devicePixelRatio || 1.5 : 1.5);
    this.pageAspect = height / Math.max(1, width);
    this.baseWidth = Math.max(512, Math.min(1024, Math.round(width * this.dpr)));
  }

  public setBookAndSettings(book: Book, settings: ReaderSettings) {
    const bookChanged = !this.currentBook || this.currentBook.id !== book.id || this.currentBook.updatedAt !== book.updatedAt;
    const settingsChanged = !this.currentSettings ||
      this.currentSettings.paperTexture !== settings.paperTexture ||
      this.currentSettings.fontSize !== settings.fontSize ||
      this.currentSettings.fontFamily !== settings.fontFamily ||
      this.currentSettings.lineHeight !== settings.lineHeight ||
      this.currentSettings.theme !== settings.theme ||
      this.currentSettings.marginSize !== settings.marginSize;

    this.currentBook = book;
    this.currentSettings = settings;

    if (bookChanged || settingsChanged) {
      this.invalidateAll();
    }
  }

  public invalidateAll() {
    if (this.gl) {
      this.cache.forEach((info) => {
        if (info.glTexture) {
          this.gl?.deleteTexture(info.glTexture);
        }
      });
    }
    this.cache.clear();
  }

  public getTexture(pageNumber: number): PageTextureInfo {
    if (this.cache.has(pageNumber)) {
      return this.cache.get(pageNumber)!;
    }

    const info = this.renderPageToTexture(pageNumber);
    this.cache.set(pageNumber, info);
    return info;
  }

  /**
   * Preloads adjacent pages into memory so page turns are instantaneous without hitching.
   */
  public preloadRange(startPage: number, endPage: number) {
    if (!this.currentBook) return;
    const min = Math.max(1, startPage);
    const max = Math.min(this.currentBook.totalPages, endPage);

    for (let p = min; p <= max; p++) {
      if (!this.cache.has(p)) {
        const info = this.renderPageToTexture(p);
        this.cache.set(p, info);
      }
    }
  }

  private renderPageToTexture(pageNumber: number): PageTextureInfo {
    const w = this.baseWidth;
    const h = Math.round(this.baseWidth * this.pageAspect);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (ctx && this.currentBook && this.currentSettings) {
      const pageData = this.currentBook.pages.find((p) => p.pageNumber === pageNumber);
      this.drawPageContent(ctx, pageData, pageNumber, w, h, this.currentBook, this.currentSettings);
    }

    const glTexture = this.gl ? this.createGLTexture(canvas) : null;

    return {
      pageNumber,
      canvas,
      glTexture,
      width: w,
      height: h,
      aspectRatio: this.pageAspect,
      isReady: true,
      isDirty: false,
    };
  }

  private createGLTexture(canvas: HTMLCanvasElement): WebGLTexture | null {
    if (!this.gl) return null;
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Enable UNPACK_FLIP_Y_WEBGL so HTML Canvas Y=0 (top of page) aligns with 3D mesh V=1 (top of mesh)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
  }

  /**
   * High-fidelity 2D Canvas Typography & Paper Renderer.
   */
  private drawPageContent(
    ctx: CanvasRenderingContext2D,
    page: PageData | undefined,
    pageNum: number,
    w: number,
    h: number,
    book: Book,
    settings: ReaderSettings
  ) {
    // 1. Paper Background & Subtle Grain
    let bgFill = '#FDFBF7';
    let textColor = '#111827'; // High-contrast rich deep dark ink
    let subTextColor = '#6B7280';
    let accentColor = '#4F46E5'; // Elegant royal indigo accent for drop caps & flourishes
    let borderColor = 'rgba(209, 213, 219, 0.6)';

    switch (settings.paperTexture) {
      case 'parchment':
        bgFill = '#F5EEDB';
        textColor = '#18130B';
        subTextColor = '#6B5A40';
        accentColor = '#5C4328';
        borderColor = 'rgba(160, 140, 105, 0.45)';
        break;
      case 'washi':
        bgFill = '#FAF7EE';
        textColor = '#141210';
        subTextColor = '#696052';
        accentColor = '#4B5563';
        borderColor = 'rgba(185, 172, 148, 0.5)';
        break;
      case 'linen':
        bgFill = '#F4EFE6';
        textColor = '#110F0D';
        subTextColor = '#61584A';
        accentColor = '#4B5563';
        borderColor = 'rgba(175, 160, 138, 0.55)';
        break;
      case 'sepia':
        bgFill = '#EFE6D5';
        textColor = '#221508';
        subTextColor = '#6E583F';
        accentColor = '#7A431D';
        borderColor = 'rgba(170, 145, 120, 0.4)';
        break;
      case 'dark':
        bgFill = '#18181B';
        textColor = '#F4F4F5';
        subTextColor = '#A1A1AA';
        accentColor = '#818CF8';
        borderColor = 'rgba(63, 63, 70, 0.5)';
        break;
      case 'slate':
        bgFill = '#0F172A';
        textColor = '#F8FAFC';
        subTextColor = '#94A3B8';
        accentColor = '#60A5FA';
        borderColor = 'rgba(51, 65, 85, 0.5)';
        break;
      case 'emerald':
        bgFill = '#06281E';
        textColor = '#F0FDF4';
        subTextColor = '#86EFAC';
        accentColor = '#34D399';
        borderColor = 'rgba(22, 101, 52, 0.5)';
        break;
      case 'cream':
      default:
        bgFill = '#FDFCF8';
        textColor = '#111827';
        subTextColor = '#6B7280';
        accentColor = '#4F46E5';
        borderColor = 'rgba(229, 231, 235, 0.8)';
        break;
    }

    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, w, h);

    // Procedural paper grain / fiber simulation
    if (settings.paperTexture !== 'dark' && settings.paperTexture !== 'slate' && settings.paperTexture !== 'emerald') {
      ctx.fillStyle = 'rgba(0,0,0,0.015)';
      for (let i = 0; i < 400; i++) {
        const rx = (Math.sin(i * 997 + pageNum) * 0.5 + 0.5) * w;
        const ry = (Math.cos(i * 613 + pageNum) * 0.5 + 0.5) * h;
        ctx.fillRect(rx, ry, 1.5, 1.5);
      }
    }

    // Subtle edge gradient shading (gutter & outer edges)
    const isLeft = pageNum % 2 === 0;
    const gutterGrad = ctx.createLinearGradient(isLeft ? w - 36 : 0, 0, isLeft ? w : 36, 0);
    gutterGrad.addColorStop(0, 'rgba(0,0,0,0.07)');
    gutterGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gutterGrad;
    ctx.fillRect(isLeft ? w - 36 : 0, 0, 36, h);

    // Outer deckle edge subtle vignette
    const outerGrad = ctx.createLinearGradient(isLeft ? 0 : w - 24, 0, isLeft ? 24 : w, 0);
    outerGrad.addColorStop(0, isLeft ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0)');
    outerGrad.addColorStop(1, isLeft ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.04)');
    ctx.fillStyle = outerGrad;
    ctx.fillRect(isLeft ? 0 : w - 24, 0, 24, h);

    if (!page) {
      ctx.fillStyle = subTextColor;
      ctx.font = 'italic 16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Blank Page', w / 2, h / 2);
      return;
    }

    const padX = Math.round(w * 0.1);
    const padY = Math.round(h * 0.08);
    const contentW = w - padX * 2;

    // Font Family Selection
    let serifFont = 'EB Garamond, Garamond, Georgia, serif';
    if (settings.fontFamily === 'cinzel') serifFont = 'Cinzel, serif';
    else if (settings.fontFamily === 'playfair') serifFont = 'Playfair Display, Georgia, serif';
    else if (settings.fontFamily === 'merriweather') serifFont = 'Merriweather, serif';
    else if (settings.fontFamily === 'mono') serifFont = 'JetBrains Mono, monospace';
    else if (settings.fontFamily === 'sans') serifFont = 'Plus Jakarta Sans, sans-serif';

    // 2. Cover Page
    if (page.isCover) {
      // Vintage ornamental borders
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(padX * 0.6, padY * 0.6, w - padX * 1.2, h - padY * 1.2);
      ctx.strokeRect(padX * 0.6 + 6, padY * 0.6 + 6, w - padX * 1.2 - 12, h - padY * 1.2 - 12);

      // Top badge
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("COLLECTOR'S EDITION", w / 2, padY + 30);

      // Stars
      ctx.font = '16px serif';
      ctx.fillText('✦  ✦  ✦', w / 2, padY + 60);

      // Title
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(w * 0.07)}px ${serifFont}`;
      const titleLines = this.wrapText(ctx, book.title, contentW);
      let curY = h * 0.38;
      titleLines.forEach((line) => {
        ctx.fillText(line, w / 2, curY);
        curY += Math.round(w * 0.085);
      });

      // Divider line
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 40, curY + 10);
      ctx.lineTo(w / 2 + 40, curY + 10);
      ctx.stroke();

      // Author
      ctx.fillStyle = subTextColor;
      ctx.font = `bold ${Math.round(w * 0.03)}px sans-serif`;
      ctx.fillText(`BY ${book.author.toUpperCase()}`, w / 2, curY + 45);

      if (book.coverSubtitle) {
        ctx.font = `italic ${Math.round(w * 0.026)}px ${serifFont}`;
        ctx.fillText(book.coverSubtitle, w / 2, curY + 80);
      }

      // Bottom Metadata
      ctx.fillStyle = subTextColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${book.totalPages} PAGES • ${book.totalWords.toLocaleString()} WORDS`, w / 2, h - padY - 20);
      return;
    }

    // 3. Table of Contents
    if (page.isTableOfContents) {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CONTENTS', w / 2, padY);

      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(w * 0.045)}px ${serifFont}`;
      ctx.fillText('Table of Contents', w / 2, padY + 30);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, padY + 45);
      ctx.lineTo(w - padX, padY + 45);
      ctx.stroke();

      let rowY = padY + 80;
      book.chapters.forEach((ch, idx) => {
        if (rowY > h - padY - 40) return;
        ctx.textAlign = 'left';
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`${String(idx + 1).padStart(2, '0')}.`, padX, rowY);

        ctx.fillStyle = textColor;
        ctx.font = `15px ${serifFont}`;
        ctx.fillText(ch.title, padX + 30, rowY);

        ctx.textAlign = 'right';
        ctx.fillStyle = subTextColor;
        ctx.font = '13px sans-serif';
        ctx.fillText(`p. ${ch.pageNumber}`, w - padX, rowY);

        rowY += 34;
      });

      // Page number bottom
      ctx.textAlign = 'center';
      ctx.fillStyle = subTextColor;
      ctx.font = '12px sans-serif';
      ctx.fillText(String(pageNum), w / 2, h - padY * 0.5);
      return;
    }

    // 4. Back Cover / Finis
    if (page.isBackCover) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(padX * 0.8, padY * 0.8, w - padX * 1.6, h - padY * 1.6);

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FINIS', w / 2, padY + 40);

      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(w * 0.05)}px ${serifFont}`;
      ctx.fillText('End of the Volume', w / 2, padY + 80);

      ctx.fillStyle = subTextColor;
      ctx.font = `italic 16px ${serifFont}`;
      ctx.fillText(`Completed "${book.title}"`, w / 2, h * 0.45);
      ctx.fillText(`By ${book.author}`, w / 2, h * 0.45 + 30);

      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${book.totalPages} Pages • ${book.totalWords.toLocaleString()} Words`, w / 2, h - padY - 30);
      return;
    }

    // 5. Standard Content Page
    // Running Head (Top Header on Non-Chapter Pages or spread right page)
    if (!page.chapterTitle) {
      ctx.fillStyle = subTextColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = isLeft ? 'left' : 'right';
      const headerTitle = isLeft
        ? book.title
        : book.title;
      ctx.fillText(headerTitle.slice(0, 36), isLeft ? padX : w - padX, padY * 0.65);
    }

    let curY = padY + 10;

    // Centered Chapter Title Header (matching Image 3 & 4)
    if (page.chapterTitle) {
      // 1. Chapter number
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(settings.fontSize * 1.35)}px ${serifFont}`;
      ctx.textAlign = 'center';
      ctx.fillText(String(page.chapterIndex || 1), w / 2, curY + 15);
      curY += 28;

      // 2. Diamond ornament line
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 28, curY);
      ctx.lineTo(w / 2 - 6, curY);
      ctx.moveTo(w / 2 + 6, curY);
      ctx.lineTo(w / 2 + 28, curY);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.font = '10px serif';
      ctx.fillText('◇', w / 2, curY + 3);
      curY += 28;

      // 3. Chapter Title
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(settings.fontSize * 1.6)}px ${serifFont}`;
      ctx.fillText(page.chapterTitle, w / 2, curY);
      curY += 26;

      // 4. Subtle ornamental flourish below title
      ctx.fillStyle = accentColor;
      ctx.font = '14px serif';
      ctx.fillText('❖', w / 2, curY);
      curY += 36;
    }

    // Blockquote
    if (page.quote) {
      ctx.fillStyle = 'rgba(0,0,0,0.025)';
      ctx.fillRect(padX, curY, contentW, 58);

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(padX, curY);
      ctx.lineTo(padX, curY + 58);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = `italic ${Math.round(settings.fontSize * 0.95)}px ${serifFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(`"${page.quote.slice(0, 90)}..."`, padX + 16, curY + 32);

      curY += 72;
    }

    // Paragraphs & Drop Caps
    const fontSize = Math.max(14, Math.round(settings.fontSize * (w / 640)));
    const lineHeight = Math.round(fontSize * (settings.lineHeight || 1.65));
    ctx.font = `${fontSize}px ${serifFont}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';

    const maxContentY = h - padY - (page.footnote ? 48 : 28);

    for (let pIdx = 0; pIdx < page.paragraphs.length; pIdx++) {
      if (curY >= maxContentY) break;
      const text = page.paragraphs[pIdx];
      if (!text) continue;

      // Illuminated Drop Cap for first paragraph of chapter opening
      const isFirstParagraph = pIdx === 0 && (page.chapterTitle !== undefined || pageNum === 4);
      if (isFirstParagraph && settings.dropCaps && text.length > 2) {
        const firstLetter = text[0];
        const restOfText = text.slice(1);

        const dropCapSize = Math.round(lineHeight * 2.5);
        const dropCapBoxW = Math.round(dropCapSize * 0.85);
        const dropCapBoxH = Math.round(lineHeight * 2.2);

        // Draw elegant royal drop cap letter
        ctx.fillStyle = accentColor;
        ctx.font = `bold ${Math.round(dropCapSize * 0.95)}px ${serifFont}`;
        ctx.textAlign = 'left';
        ctx.fillText(firstLetter, padX, curY + dropCapBoxH * 0.82);

        // Wrap first 2 lines next to drop cap
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px ${serifFont}`;
        ctx.textAlign = 'left';

        const sideW = contentW - dropCapBoxW - 8;
        const sideLines = this.wrapText(ctx, restOfText, sideW);

        // Draw up to 2 lines beside drop cap
        const besideCount = Math.min(2, sideLines.length);
        for (let l = 0; l < besideCount; l++) {
          if (settings.textAlign === 'justify' && l < besideCount - 1) {
            this.drawJustifiedLine(ctx, sideLines[l], padX + dropCapBoxW + 8, curY + (l + 1) * lineHeight * 0.85, sideW);
          } else {
            ctx.fillText(sideLines[l], padX + dropCapBoxW + 8, curY + (l + 1) * lineHeight * 0.85);
          }
        }

        curY += dropCapBoxH + 4;

        // Wrap remaining text across full width
        if (sideLines.length > besideCount) {
          const remainingText = sideLines.slice(besideCount).join(' ');
          const fullLines = this.wrapText(ctx, remainingText, contentW);
          for (let l = 0; l < fullLines.length; l++) {
            if (curY >= maxContentY) break;
            if (settings.textAlign === 'justify' && l < fullLines.length - 1) {
              this.drawJustifiedLine(ctx, fullLines[l], padX, curY, contentW);
            } else {
              ctx.fillText(fullLines[l], padX, curY);
            }
            curY += lineHeight;
          }
        }
      } else {
        const lines = this.wrapText(ctx, text, contentW);
        for (let l = 0; l < lines.length; l++) {
          if (curY >= maxContentY) break;
          if (settings.textAlign === 'justify' && l < lines.length - 1) {
            this.drawJustifiedLine(ctx, lines[l], padX, curY, contentW);
          } else {
            ctx.fillText(lines[l], padX, curY);
          }
          curY += lineHeight;
        }
      }
      curY += Math.round(lineHeight * 0.5);
    }

    // Centered star flourish at bottom of chapter page
    if (page.chapterTitle && curY < h - padY - 35) {
      ctx.fillStyle = accentColor;
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✶', w / 2, h - padY - 30);
    }

    // Footnote
    if (page.footnote) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(padX, h - padY - 25);
      ctx.lineTo(padX + 80, h - padY - 25);
      ctx.stroke();

      ctx.fillStyle = subTextColor;
      ctx.font = `italic 11px ${serifFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(page.footnote.slice(0, 80), padX, h - padY - 8);
    }

    // Bottom page number in format "X of Y"
    if (settings.showPageNumbers) {
      ctx.fillStyle = subTextColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pageNum} of ${book.totalPages}`, w / 2, h - padY * 0.35);
    }
  }

  private drawJustifiedLine(ctx: CanvasRenderingContext2D, line: string, x: number, y: number, maxWidth: number) {
    const words = line.trim().split(' ');
    if (words.length <= 1) {
      ctx.fillText(line, x, y);
      return;
    }

    let totalWordsWidth = 0;
    const wordWidths = words.map((w) => {
      const metrics = ctx.measureText(w);
      totalWordsWidth += metrics.width;
      return metrics.width;
    });

    const totalSpace = maxWidth - totalWordsWidth;
    const spacePerGap = Math.max(2, totalSpace / (words.length - 1));

    // If spaces would be absurdly large, fall back to natural spacing
    if (spacePerGap > 28) {
      ctx.fillText(line, x, y);
      return;
    }

    let currentX = x;
    for (let i = 0; i < words.length; i++) {
      ctx.fillText(words[i], currentX, y);
      currentX += wordWidths[i] + spacePerGap;
    }
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  public dispose() {
    this.invalidateAll();
  }
}
