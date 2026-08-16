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
      className={`relative w-full mx-auto flex flex-col items-center justify-center select-none transition-all duration-300 ${
        isFullscreen ? 'max-w-7xl h-full px-2 sm:px-4' : 'max-w-6xl'
      }`}
    >
      {/* Floating Zen Mode Exit Control */}
      {isFullscreen && (
        <div
          className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
            showExitHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={onToggleFullscreen}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 text-stone-100 hover:bg-stone-900 border border-stone-700/60 backdrop-blur-md text-xs font-sans shadow-xl cursor-pointer hover:scale-105 transition-all"
            title="Exit Full Screen Mode (Esc or F)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="font-medium">Exit Full Screen</span>
            <span className="text-[10px] text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">Esc</span>
          </button>
        </div>
      )}

      {/* Atmospheric Lighting Overlay */}
      {settings.atmosphere && settings.atmosphere !== 'studio' && (
        <div className={`lighting-${settings.atmosphere}`} />
      )}

      {/* 3D Physical Book Housing Frame */}
      <div
        className={`relative w-full flex items-center justify-center transition-all duration-300 ${
          isFullscreen
            ? 'h-[calc(100vh-5rem)] sm:h-[calc(100vh-5.5rem)] min-h-[500px]'
            : 'min-h-[560px] sm:min-h-[640px] md:min-h-[720px]'
        }`}
      >
        {/* Outer Hardcover Leather Base & Embossed Edges */}
        <div
          className="absolute inset-[-12px] sm:inset-[-20px] bg-[#342D24] dark:bg-[#141210] rounded-2xl pointer-events-none transition-all duration-300"
          style={{
            boxShadow:
              '0 32px 80px rgba(0,0,0,0.48), 0 8px 24px rgba(0,0,0,0.28), inset 0 0 35px rgba(0,0,0,0.7)',
          }}
        >
          {/* Subtle Leather Stitching lines */}
          <div className="absolute inset-2 border border-dashed border-[#8A785D]/30 dark:border-stone-700/30 rounded-xl pointer-events-none" />

          {/* Brass / Gold Book Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-600/50 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-600/50 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-600/50 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-600/50 rounded-br-xl pointer-events-none" />
        </div>

        {/* Left Stack Paper Edges (Physical Thickness) */}
        {isSpreadMode && (
          <div
            className="absolute top-[-2px] bottom-[-2px] rounded-l-xs page-edges-left border-y border-l border-[#DCD7C9] dark:border-stone-700 z-10 transition-all duration-300 pointer-events-none"
            style={{
              left: `-${leftStackPx}px`,
              width: `${leftStackPx}px`,
              boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
            }}
          />
        )}

        {/* Right Stack Paper Edges (Physical Thickness) */}
        <div
          className="absolute top-[-2px] bottom-[-2px] rounded-r-xs page-edges-right border-y border-r border-[#DCD7C9] dark:border-stone-700 z-10 transition-all duration-300 pointer-events-none"
          style={{
            right: `-${rightStackPx}px`,
            width: `${rightStackPx}px`,
            boxShadow: '4px 0 12px rgba(0,0,0,0.2)',
          }}
        />

        {/* Top & Bottom Spine Headband Trims */}
        {isSpreadMode && (
          <>
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-8 h-2.5 spine-headband rounded-t-xs z-30 shadow-xs pointer-events-none" />
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-2.5 spine-headband rounded-b-xs z-30 shadow-xs pointer-events-none" />
          </>
        )}

        {/* Physical Hanging Ribbon Bookmark */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(currentPage);
          }}
          className="absolute top-[-16px] left-1/2 -translate-x-1/2 z-40 cursor-pointer group"
          title={isBookmarked ? 'Bookmarked (Click to remove)' : 'Click to place Ribbon Bookmark'}
        >
          <div
            className={`w-4 transition-all duration-300 flex flex-col items-center ${
              isBookmarked
                ? 'h-44 bg-red-800 shadow-[0_6px_16px_rgba(139,0,0,0.45)]'
                : 'h-14 bg-red-800/60 group-hover:h-28 group-hover:bg-red-800 shadow-md'
            }`}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 8px), 0 100%)',
            }}
          >
            <div className="w-1 h-full bg-red-500/30 mr-1" />
          </div>
        </div>

        {/* MASTER GPU WEBGL CANVAS HOST CONTAINER */}
        <div
          ref={containerRef}
          className={`relative w-full ${
            isSpreadMode ? 'max-w-6xl' : 'max-w-[560px]'
          } ${
            isFullscreen
              ? 'h-[calc(100vh-6rem)] sm:h-[calc(100vh-6.5rem)]'
              : 'h-[560px] sm:h-[660px] md:h-[720px]'
          } rounded-xs overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.18)] cursor-grab active:cursor-grabbing touch-none flex items-center justify-center`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block bg-transparent"
            style={{ touchAction: 'none' }}
          />

          {/* Discreet Peel Corner Cue in Idle State */}
          {gestureState === 'IDLE' && (
            <div className="absolute bottom-2 right-2 pointer-events-none z-20 flex items-center gap-1 bg-stone-900/40 text-stone-200 text-[10px] px-2 py-1 rounded-full backdrop-blur-xs opacity-40 hover:opacity-100 transition-opacity">
              <span>Peel or drag edge</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Tactile Page Scrubber */}
      <div
        className={`w-full max-w-2xl px-6 mt-3 flex flex-col items-center gap-1.5 transition-opacity duration-300 ${
          isFullscreen && !showExitHint ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] text-[#8C8471] font-mono">1</span>
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
            className="w-full h-1.5 bg-stone-300/50 dark:bg-stone-700/50 rounded-lg appearance-none cursor-pointer accent-[#8B0000]"
          />
          <span className="text-[10px] text-[#8C8471] font-mono">{book.totalPages}</span>
        </div>
      </div>

      {/* Floating Bottom Bar: Navigation & Page Stats */}
      <div
        className={`w-full flex items-center justify-between mt-4 px-4 max-w-4xl text-xs text-[#8C8471] font-sans transition-opacity duration-300 ${
          isFullscreen && !showExitHint ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={handleTurnPrev}
          disabled={currentPage <= 1 || gestureState !== 'IDLE'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FDFCF8] dark:bg-[#1C1C1E] border border-[#DCD7C9] dark:border-stone-700 hover:border-[#5A5A40] hover:bg-[#E8E4D8]/50 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs text-[#5A5A40] dark:text-amber-400 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">Previous</span>
        </button>

        {/* Page progress pill */}
        <div className="flex items-center gap-3 bg-stone-500/10 px-4 py-1.5 rounded-full border border-stone-300/40 dark:border-stone-700/40">
          <span className="font-sans font-medium text-[#1A1A1A] dark:text-stone-200">
            Page {currentPage} of {book.totalPages}
          </span>
          <span className="text-[#DCD7C9] dark:text-stone-600">•</span>
          <span className="text-[#5A5A40] dark:text-amber-400 font-semibold">
            {Math.round((currentPage / Math.max(book.totalPages, 1)) * 100)}% Read
          </span>

          {/* Physics Telemetry Toggle */}
          <button
            onClick={() => setIsDebugOpen((prev) => !prev)}
            className="ml-2 p-1 rounded hover:bg-stone-500/20 text-stone-500 hover:text-amber-500 transition-colors"
            title="Toggle Real-Time Paper Physics Telemetry (or press 'D')"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleTurnNext}
          disabled={currentPage >= book.totalPages || gestureState !== 'IDLE'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FDFCF8] dark:bg-[#1C1C1E] border border-[#DCD7C9] dark:border-stone-700 hover:border-[#5A5A40] hover:bg-[#E8E4D8]/50 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs text-[#5A5A40] dark:text-amber-400 cursor-pointer"
        >
          <span className="font-semibold uppercase tracking-wider text-[11px]">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

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
