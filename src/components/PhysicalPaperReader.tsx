import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, ReaderSettings } from '../types';
import { PaperEngine } from '../engine/PaperEngine';
import { EngineDebugInfo, GestureState, QualityLevel } from '../engine/types';
import { DebugOverlay } from './DebugOverlay';
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, Sparkles, Terminal, Minimize2, Maximize2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audioSynthesizer';

interface PhysicalPaperReaderProps {
  book: Book;
  settings: ReaderSettings;
  onPageChange: (newPage: number) => void;
  onToggleBookmark: (pageNumber: number) => void;
  onAddHighlight?: (pageNumber: number, text: string, color: 'amber' | 'sage' | 'rose' | 'sky') => void;
  searchQuery?: string;
  onToggleHUD?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const PhysicalPaperReader: React.FC<PhysicalPaperReaderProps> = ({
  book,
  settings,
  onPageChange,
  onToggleBookmark,
  onAddHighlight,
  searchQuery = '',
  onToggleHUD,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PaperEngine | null>(null);

  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>('HIGH');
  const [debugInfo, setDebugInfo] = useState<EngineDebugInfo | null>(null);
  const [gestureState, setGestureState] = useState<GestureState>('IDLE');
  const [showExitHint, setShowExitHint] = useState(true);

  // Auto-hide floating controls in fullscreen when idle
  useEffect(() => {
    if (!isFullscreen) {
      setShowExitHint(true);
      return;
    }

    let timer: NodeJS.Timeout;
    const handleUserActivity = () => {
      setShowExitHint(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setShowExitHint(false);
      }, 2800);
    };

    handleUserActivity();
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [isFullscreen]);

  const isSpreadMode = settings.readingMode === 'spread';
  const currentPage = book.currentPage;

  // Physical stack thickness (calculated from reading progress)
  const leftStackPx = Math.max(3, Math.min(22, Math.round((currentPage / Math.max(book.totalPages, 1)) * 18)));
  const rightStackPx = Math.max(3, Math.min(22, Math.round(((book.totalPages - currentPage) / Math.max(book.totalPages, 1)) * 18)));

  const isBookmarked = book.bookmarks.some((b) => b.pageNumber === currentPage);

  // Initialize and maintain PaperEngine lifecycle
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const engine = new PaperEngine({
      canvas: canvasRef.current,
      book,
      settings,
      isSpreadMode,
      qualityLevel,
      onPageChange: (newPage) => {
        onPageChange(newPage);
        if (newPage >= book.totalPages) {
          try {
            confetti({
              particleCount: 75,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}
        }
      },
      onStateChange: (state) => {
        setGestureState(state);
      },
    });

    engineRef.current = engine;

    // Responsive ResizeObserver
    const handleResize = () => {
      if (!containerRef.current || !engineRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        engineRef.current.resize(rect.width, rect.height);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    handleResize();

    // Telemetry ticker for debug overlay
    const telemetryInterval = setInterval(() => {
      if (engineRef.current) {
        setDebugInfo(engineRef.current.getDebugInfo());
      }
    }, 150);

    return () => {
      clearInterval(telemetryInterval);
      resizeObserver.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Update book and settings when props change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateBookAndSettings(book, settings);
    }
  }, [book, settings]);

  // Update spread mode & trigger re-layout
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSpreadMode(isSpreadMode);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        engineRef.current.resize(rect.width, rect.height);
      }
    }
  }, [isSpreadMode, isFullscreen]);

  // Update quality level
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setQuality(qualityLevel);
    }
  }, [qualityLevel]);

  // Keyboard navigation & full screen toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onToggleFullscreen?.();
      } else if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        onToggleFullscreen?.();
      } else if (settings.enableKeyboardShortcuts) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault();
          engineRef.current?.triggerAutoTurn('forward');
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          engineRef.current?.triggerAutoTurn('backward');
        } else if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          onToggleBookmark(currentPage);
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          setIsDebugOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.enableKeyboardShortcuts, currentPage, onToggleBookmark, isFullscreen, onToggleFullscreen]);

  const handleTurnNext = useCallback(() => {
    engineRef.current?.triggerAutoTurn('forward');
  }, []);

  const handleTurnPrev = useCallback(() => {
    engineRef.current?.triggerAutoTurn('backward');
  }, []);

  return (
    <div
      id="physical-book-stage"
      className={`select-none transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen m-0 p-0 overflow-hidden flex flex-col items-center justify-center bg-[#151923]'
          : 'relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center'
      }`}
    >
      {/* Floating Zen Mode Exit Control */}
      {isFullscreen && (
        <div
          className={`fixed top-5 right-5 z-50 transition-opacity duration-300 ${
            showExitHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={onToggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 border border-white/20 backdrop-blur-md text-xs font-sans shadow-2xl cursor-pointer hover:scale-105 transition-all"
            title="Exit Full Screen Mode (Esc or F)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="font-semibold">Exit Full Screen</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Esc</span>
          </button>
        </div>
      )}

      {/* Fullscreen Edge Click Zones & Hover Navigation Chevrons */}
      {isFullscreen && (
        <>
          <button
            onClick={handleTurnPrev}
            disabled={currentPage <= 1 || gestureState !== 'IDLE'}
            className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-slate-900/70 hover:bg-slate-900/95 text-white/80 hover:text-white border border-white/15 backdrop-blur-md shadow-2xl transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none ${
              showExitHint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
            }`}
            title="Previous Page (Left Arrow or Drag Left Edge)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleTurnNext}
            disabled={currentPage >= book.totalPages || gestureState !== 'IDLE'}
            className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-slate-900/70 hover:bg-slate-900/95 text-white/80 hover:text-white border border-white/15 backdrop-blur-md shadow-2xl transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none ${
              showExitHint ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
            }`}
            title="Next Page (Right Arrow or Drag Right Edge)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Atmospheric Lighting Overlay */}
      {settings.atmosphere && settings.atmosphere !== 'studio' && (
        <div className={`lighting-${settings.atmosphere}`} />
      )}

      {/* 3D Physical Book Housing Frame */}
      <div
        className={`relative w-full flex items-center justify-center transition-all duration-300 ${
          isFullscreen
            ? 'w-screen h-screen max-w-none max-h-none m-0 p-0'
            : 'min-h-[560px] sm:min-h-[640px] md:min-h-[720px]'
        }`}
      >
        {/* Outer Hardcover Base & Soft Shadow (only in windowed mode) */}
        {!isFullscreen && (
          <div
            className="absolute inset-[-10px] sm:inset-[-16px] bg-[#222738] rounded-2xl pointer-events-none transition-all duration-300"
            style={{
              boxShadow:
                '0 24px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12), inset 0 0 20px rgba(0,0,0,0.4)',
            }}
          >
            {/* Subtle perimeter border */}
            <div className="absolute inset-1.5 border border-white/10 rounded-xl pointer-events-none" />

            {/* Clean Metallic Book Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-slate-500/40 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-slate-500/40 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-slate-500/40 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-slate-500/40 rounded-br-xl pointer-events-none" />
          </div>
        )}

        {/* Left Stack Paper Edges (Physical Thickness) */}
        {isSpreadMode && !isFullscreen && (
          <div
            className="absolute top-[-2px] bottom-[-2px] rounded-l-xs page-edges-left border-y border-l border-[#D8DEE9] z-10 transition-all duration-300 pointer-events-none"
            style={{
              left: `-${leftStackPx}px`,
              width: `${leftStackPx}px`,
              boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
            }}
          />
        )}

        {/* Right Stack Paper Edges (Physical Thickness) */}
        {!isFullscreen && (
          <div
            className="absolute top-[-2px] bottom-[-2px] rounded-r-xs page-edges-right border-y border-r border-[#D8DEE9] z-10 transition-all duration-300 pointer-events-none"
            style={{
              right: `-${rightStackPx}px`,
              width: `${rightStackPx}px`,
              boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
            }}
          />
        )}

        {/* Top & Bottom Spine Headband Trims */}
        {isSpreadMode && !isFullscreen && (
          <>
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-8 h-2.5 spine-headband rounded-t-xs z-30 shadow-xs pointer-events-none" />
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-2.5 spine-headband rounded-b-xs z-30 shadow-xs pointer-events-none" />
          </>
        )}

        {/* MASTER GPU WEBGL CANVAS HOST CONTAINER */}
        <div
          ref={containerRef}
          className={`relative ${
            isFullscreen
              ? 'w-full h-full max-w-none rounded-none shadow-none'
              : `${isSpreadMode ? 'w-full max-w-6xl' : 'w-full max-w-[560px]'} h-[560px] sm:h-[660px] md:h-[720px] rounded-xs shadow-[0_20px_50px_rgba(0,0,0,0.12)]`
          } overflow-hidden cursor-grab active:cursor-grabbing touch-none flex items-center justify-center`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block bg-transparent"
            style={{ touchAction: 'none' }}
          />

          {/* Discreet Peel Corner Cue in Idle State */}
          {gestureState === 'IDLE' && !isFullscreen && (
            <div className="absolute bottom-2 right-2 pointer-events-none z-20 flex items-center gap-1 bg-black/40 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-xs opacity-40 hover:opacity-100 transition-opacity">
              <span>Peel or drag edge</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Tactile Page Scrubber & Floating Stats Footer */}
      {!isFullscreen ? (
        <>
          {/* Windowed Mode Scrubber */}
          <div className="w-full max-w-2xl px-6 mt-3 flex flex-col items-center gap-1.5 transition-opacity duration-300">
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] text-[#667085] font-mono">1</span>
              <input
                type="range"
                min={1}
                max={book.totalPages}
                value={currentPage}
                onChange={(e) => {
                  const newPage = parseInt(e.target.value, 10);
                  if (newPage !== currentPage) {
                    if (settings.soundEffects) {
                      soundEngine.playFastFlipTick();
                    }
                    onPageChange(newPage);
                  }
                }}
                className="w-full h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#6677E8]"
              />
              <span className="text-[10px] text-[#667085] font-mono">{book.totalPages}</span>
            </div>
          </div>

          {/* Windowed Mode Bottom Bar */}
          <div className="w-full flex items-center justify-between mt-4 px-4 max-w-4xl text-xs text-[#667085] font-sans">
            <button
              onClick={handleTurnPrev}
              disabled={currentPage <= 1 || gestureState !== 'IDLE'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#E5E7EB] hover:border-[#6677E8]/40 hover:bg-[#F7F8FA] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs text-[#171B26] hover:text-[#6677E8] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold text-xs">Previous</span>
            </button>

            {/* Page progress pill */}
            <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border border-[#E5E7EB] shadow-xs">
              <span className="font-medium text-[#171B26]">
                Page {currentPage} of {book.totalPages}
              </span>
              <span className="text-[#E5E7EB]">•</span>
              <span className="text-[#6677E8] font-semibold">
                {Math.round((currentPage / Math.max(book.totalPages, 1)) * 100)}% Read
              </span>

              {/* Physics Telemetry Toggle */}
              <button
                onClick={() => setIsDebugOpen((prev) => !prev)}
                className="ml-2 p-1 rounded hover:bg-[#F7F8FA] text-[#98A2B3] hover:text-[#6677E8] transition-colors cursor-pointer"
                title="Toggle Real-Time Paper Physics Telemetry (or press 'D')"
              >
                <Terminal className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleTurnNext}
              disabled={currentPage >= book.totalPages || gestureState !== 'IDLE'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#E5E7EB] hover:border-[#6677E8]/40 hover:bg-[#F7F8FA] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs text-[#171B26] hover:text-[#6677E8] cursor-pointer"
            >
              <span className="font-semibold text-xs">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        /* Fullscreen Discreet Floating Bottom Bar */
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 ${
            showExitHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-slate-900/90 text-white border border-white/20 backdrop-blur-md text-xs font-sans shadow-2xl">
            <span className="font-medium">
              Page {currentPage} of {book.totalPages}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[#8B98F5] font-semibold">
              {Math.round((currentPage / Math.max(book.totalPages, 1)) * 100)}%
            </span>
            <div className="w-28 sm:w-44 ml-2">
              <input
                type="range"
                min={1}
                max={book.totalPages}
                value={currentPage}
                onChange={(e) => {
                  const newPage = parseInt(e.target.value, 10);
                  if (newPage !== currentPage) {
                    if (settings.soundEffects) {
                      soundEngine.playFastFlipTick();
                    }
                    onPageChange(newPage);
                  }
                }}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6677E8]"
              />
            </div>
            <button
              onClick={() => setIsDebugOpen((prev) => !prev)}
              className="ml-1 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Physics Telemetry (or press 'D')"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Development Debug Overlay */}
      {debugInfo && (
        <DebugOverlay
          debugInfo={debugInfo}
          isOpen={isDebugOpen}
          onClose={() => setIsDebugOpen(false)}
          onQualityChange={setQualityLevel}
          onTestTurn={(dir) => engineRef.current?.triggerAutoTurn(dir)}
        />
      )}
    </div>
  );
};
