import React, { useState, useEffect, useRef } from 'react';
import { Book, ReaderSettings } from '../types';
import {
  Library,
  Search,
  List,
  Bookmark as BookmarkIcon,
  Sliders,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Flame,
  CloudRain,
  Building2,
  Coffee,
  ChevronLeft,
  ChevronRight,
  SunMedium,
  Moon,
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';

interface ReaderHUDProps {
  book: Book;
  settings: ReaderSettings;
  isVisible: boolean;
  onPageChange: (newPage: number) => void;
  onBackToLibrary: () => void;
  onOpenTOC: () => void;
  onOpenBookmarks: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleBookmark: (pageNumber: number) => void;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const ReaderHUD: React.FC<ReaderHUDProps> = ({
  book,
  settings,
  isVisible,
  onPageChange,
  onBackToLibrary,
  onOpenTOC,
  onOpenBookmarks,
  onOpenSearch,
  onOpenSettings,
  onToggleBookmark,
  onUpdateSettings,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [sliderVal, setSliderVal] = useState(book.currentPage);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);

  useEffect(() => {
    setSliderVal(book.currentPage);
  }, [book.currentPage]);

  // Text to speech implementation
  const handlePlayTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const page = book.pages.find((p) => p.pageNumber === book.currentPage);
    if (!page || page.isCover) {
      const textToRead = `${book.title} by ${book.author}. Table of contents and chapters follow.`;
      speakText(textToRead);
      return;
    }

    const textToRead = page.paragraphs.join(' ');
    speakText(textToRead);
  };

  const speakText = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utter.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utter.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    window.speechSynthesis.speak(utter);
  };

  const handleStopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const isBookmarked = book.bookmarks.some((b) => b.pageNumber === book.currentPage);
  const currentChapter = book.chapters
    .slice()
    .reverse()
    .find((c) => book.currentPage >= c.pageNumber);

  return (
    <>
      {/* Top Floating Minimal HUD Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 p-2 sm:p-4 flex items-center justify-between transition-all duration-300 pointer-events-none ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Left: Back to Library */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#FDFCF8]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-300/70 dark:border-stone-700/70 shadow-lg text-xs font-sans text-stone-800 dark:text-stone-200">
          <button
            onClick={() => {
              onBackToLibrary();
            }}
            className="flex items-center gap-1.5 hover:text-[#5A5A40] dark:hover:text-amber-300 transition-colors font-medium cursor-pointer"
            title="Return to Bookshelf"
          >
            <Library className="w-4 h-4" />
            <span className="hidden sm:inline">Shelf</span>
          </button>
        </div>

        {/* Center: Title & Chapter pill */}
        <div className="pointer-events-auto bg-[#FDFCF8]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-stone-300/70 dark:border-stone-700/70 shadow-lg flex items-center gap-2 text-xs font-sans max-w-[200px] sm:max-w-md truncate">
          <span className="font-serif font-bold truncate text-stone-900 dark:text-stone-100">
            {book.title}
          </span>
          {currentChapter && (
            <>
              <span className="text-stone-400">•</span>
              <span className="text-stone-600 dark:text-stone-400 truncate text-[11px]">
                {currentChapter.title}
              </span>
            </>
          )}
        </div>

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto bg-[#FDFCF8]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-stone-300/70 dark:border-stone-700/70 shadow-lg text-xs font-sans text-stone-700 dark:text-stone-200">
          {/* Quick Bookmark Toggle */}
          <button
            onClick={() => {
              if (settings.soundEffects) soundEngine.playBookmarkSound();
              onToggleBookmark(book.currentPage);
            }}
            className={`p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
              isBookmarked ? 'text-red-600' : 'text-stone-600 dark:text-stone-300'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Page'}
          >
            <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Table of Contents */}
          <button
            onClick={onOpenTOC}
            className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title="Table of Contents"
          >
            <List className="w-4 h-4" />
          </button>

          {/* In-Book Search */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title="Search Book"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Typography & Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title="Reader Settings & Typography"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Zen Reading Mode */}
          <button
            onClick={onToggleFullscreen}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Full Screen Reading Mode (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-500" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-medium">
              {isFullscreen ? 'Exit Full' : 'Full Screen'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Minimal Scrubber HUD */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="w-full max-w-xl bg-[#FDFCF8]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-2xl border border-stone-300/70 dark:border-stone-700/70 shadow-2xl pointer-events-auto flex flex-col gap-2 font-sans">
          {/* Top Scrubber Row */}
          <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
            <span className="font-semibold text-[11px] text-stone-800 dark:text-stone-100">
              Page {book.currentPage} of {book.totalPages}
            </span>

            {/* Quick Play Audio & Ambient */}
            <div className="flex items-center gap-2">
              {/* TTS Read Aloud */}
              <button
                onClick={handlePlayTTS}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 text-[10px] font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 transition-all cursor-pointer"
                title="Read Page Aloud"
              >
                {isSpeaking ? <Pause className="w-3 h-3 text-amber-500" /> : <Play className="w-3 h-3" />}
                <span>{isSpeaking ? 'Pause' : 'Read'}</span>
              </button>

              {isSpeaking && (
                <button
                  onClick={handleStopTTS}
                  className="p-1 rounded-full text-stone-500 hover:text-red-500 cursor-pointer"
                  title="Stop Reading"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              )}

              {/* Ambient Sound Icon */}
              <button
                onClick={() => {
                  const nextSound: ReaderSettings['ambientSound'] =
                    settings.ambientSound === 'none'
                      ? 'library'
                      : settings.ambientSound === 'library'
                      ? 'rain'
                      : settings.ambientSound === 'rain'
                      ? 'fireplace'
                      : 'none';
                  onUpdateSettings({ ambientSound: nextSound });
                  soundEngine.setAmbientSound(nextSound, settings.ambientVolume);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-[10px] text-stone-600 dark:text-stone-300 transition-all cursor-pointer"
                title={`Ambient Sound: ${settings.ambientSound}`}
              >
                {settings.ambientSound === 'fireplace' ? (
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                ) : settings.ambientSound === 'rain' ? (
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                ) : settings.ambientSound === 'library' ? (
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                )}
                <span className="capitalize hidden sm:inline">{settings.ambientSound}</span>
              </button>
            </div>
          </div>

          {/* Page Scrubber Slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPageChange(Math.max(1, book.currentPage - 1))}
              disabled={book.currentPage <= 1}
              className="p-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1"
              max={book.totalPages}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              onMouseUp={() => onPageChange(sliderVal)}
              onTouchEnd={() => onPageChange(sliderVal)}
              className="flex-1 accent-[#5A5A40] dark:accent-amber-400 cursor-pointer h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg"
            />

            <button
              onClick={() => onPageChange(Math.min(book.totalPages, book.currentPage + 1))}
              disabled={book.currentPage >= book.totalPages}
              className="p-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
