import React, { useState, useEffect, useRef } from 'react';
import { Book, ReaderSettings } from '../types';
import {
  Library,
  Upload,
  Search,
  List,
  Bookmark as BookmarkIcon,
  Sliders,
  Play,
  Pause,
  Square,
  Volume2,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  VolumeX,
} from 'lucide-react';

interface ReaderToolbarProps {
  book: Book;
  settings: ReaderSettings;
  onPageChange: (newPage: number) => void;
  onOpenUpload: () => void;
  onOpenLibrary: () => void;
  onOpenTOC: () => void;
  onOpenBookmarks: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  book,
  settings,
  onPageChange,
  onOpenUpload,
  onOpenLibrary,
  onOpenTOC,
  onOpenBookmarks,
  onOpenSearch,
  onOpenSettings,
}) => {
  const [sliderVal, setSliderVal] = useState(book.currentPage);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Text to Speech (TTS) states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [showTtsControls, setShowTtsControls] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync slider when page changes externally
  useEffect(() => {
    setSliderVal(book.currentPage);
  }, [book.currentPage]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

    window.speechSynthesis.cancel();

    // Get current page content
    const page = book.pages.find((p) => p.pageNumber === book.currentPage);
    if (!page || page.isCover) {
      // Read title
      const textToRead = `${book.title} by ${book.author}. Table of contents and pages follow.`;
      speakText(textToRead);
      return;
    }

    const textToRead = page.paragraphs.join(' ');
    speakText(textToRead);
  };

  const speakText = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = speechRate;

    utter.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      // If auto reading next page is desired, could turn page here
      if (book.currentPage < book.totalPages) {
        onPageChange(book.currentPage + 1);
      }
    };

    utter.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePauseTTS = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStopTTS = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <>
      {/* Top Header Bar - Natural Tones */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 bg-[#F4F1EA]/95 backdrop-blur-md border-b border-[#DCD7C9] flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        {/* Left: App Brand & Document Info */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDFCF8] border border-[#DCD7C9] hover:border-[#5A5A40] hover:bg-[#E8E4D8]/40 text-[#5A5A40] transition-all text-xs font-sans font-semibold group shadow-xs"
            title="Open Bookshelf"
          >
            <Library className="w-3.5 h-3.5 text-[#5A5A40] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline tracking-wider uppercase text-[11px]">Bookshelf</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] font-mono font-medium">
              {book.totalPages}p
            </span>
          </button>

          <div className="hidden md:flex flex-col">
            <span className="text-xs font-serif font-bold text-[#1A1A1A] truncate max-w-[220px] lg:max-w-[320px]">
              {book.title}
            </span>
            <span className="text-[11px] font-sans text-[#8C8471] italic truncate max-w-[200px]">
              {book.author}
            </span>
          </div>
        </div>

        {/* Center: Search & Reading Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-sans">
          {/* Table of Contents */}
          <button
            onClick={onOpenTOC}
            className="px-3 py-1.5 rounded-full bg-[#FDFCF8] border border-[#DCD7C9] hover:border-[#5A5A40] text-[#5A5A40] hover:bg-[#E8E4D8]/40 transition-all text-xs flex items-center gap-1.5 shadow-xs"
            title="Table of Contents"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] font-semibold uppercase tracking-wider">Contents</span>
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="px-3 py-1.5 rounded-full bg-[#FDFCF8] border border-[#DCD7C9] hover:border-[#5A5A40] text-[#5A5A40] hover:bg-[#E8E4D8]/40 transition-all text-xs flex items-center gap-1.5 relative shadow-xs"
            title="Bookmarks"
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] font-semibold uppercase tracking-wider">Bookmarks</span>
            {book.bookmarks.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#5A5A40] text-[#F4F1EA] text-[9px] font-mono font-bold flex items-center justify-center -ml-0.5">
                {book.bookmarks.length}
              </span>
            )}
          </button>

          {/* Search in Book */}
          <button
            onClick={onOpenSearch}
            className="px-3 py-1.5 rounded-full bg-[#FDFCF8] border border-[#DCD7C9] hover:border-[#5A5A40] text-[#5A5A40] hover:bg-[#E8E4D8]/40 transition-all text-xs flex items-center gap-1.5 shadow-xs"
            title="Search inside book"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] font-semibold uppercase tracking-wider">Search</span>
          </button>

          {/* Text to Speech toggle */}
          <button
            onClick={() => setShowTtsControls(!showTtsControls)}
            className={`px-3 py-1.5 rounded-full border transition-all text-xs flex items-center gap-1.5 shadow-xs ${
              isSpeaking || showTtsControls
                ? 'bg-[#5A5A40] border-[#5A5A40] text-[#F4F1EA]'
                : 'bg-[#FDFCF8] border-[#DCD7C9] text-[#5A5A40] hover:border-[#5A5A40] hover:bg-[#E8E4D8]/40'
            }`}
            title="Voice Narration (TTS)"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] font-semibold uppercase tracking-wider">Narration</span>
          </button>
        </div>

        {/* Right: Convert New & Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="bg-[#5A5A40] text-[#F4F1EA] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-sans font-medium tracking-wide hover:shadow-md hover:bg-[#4A4A35] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline uppercase text-[11px] tracking-wider font-semibold">Upload Document</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-[#FDFCF8] border border-[#DCD7C9] hover:border-[#5A5A40] text-[#5A5A40] hover:bg-[#E8E4D8]/40 transition-all shadow-xs"
            title="Appearance & Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Popover / Bar for Speech Synthesis Narrator */}
      {showTtsControls && (
        <div className="bg-[#FDFCF8] border-b border-[#DCD7C9] px-6 py-2.5 flex items-center justify-between text-xs text-[#3A3A3A] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#5A5A40] uppercase tracking-wider text-[11px]">Audio Narrator:</span>
            <span className="text-[#8C8471] font-sans truncate max-w-[200px]">
              Reading Page {book.currentPage}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={isSpeaking ? handlePauseTTS : handlePlayTTS}
              className="px-3.5 py-1 rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] text-[#F4F1EA] font-sans font-semibold flex items-center gap-1.5 transition-all text-xs"
            >
              {isSpeaking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isSpeaking ? 'Pause' : isPaused ? 'Resume' : 'Read Page'}</span>
            </button>

            {(isSpeaking || isPaused) && (
              <button
                onClick={handleStopTTS}
                className="p-1.5 rounded-full bg-[#E8E4D8] hover:bg-[#DCD7C9] text-[#5A5A40]"
                title="Stop Audio"
              >
                <Square className="w-3 h-3" />
              </button>
            )}

            <div className="flex items-center gap-1.5 font-sans">
              <span className="text-[11px] text-[#8C8471]">Speed</span>
              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="bg-[#F4F1EA] border border-[#DCD7C9] text-[#2C2C2C] rounded-md px-2 py-0.5 text-xs focus:outline-none focus:border-[#5A5A40]"
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1.0x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation / Page Scrubbing Bar */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl px-5 py-3 bg-[#F4F1EA]/95 backdrop-blur-md border border-[#DCD7C9] rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] flex items-center justify-between gap-4 text-xs font-sans">
        {/* Prev Page Button */}
        <button
          onClick={() => onPageChange(Math.max(1, book.currentPage - 1))}
          disabled={book.currentPage <= 1}
          className="p-2 rounded-full bg-[#FDFCF8] border border-[#DCD7C9] text-[#5A5A40] hover:bg-[#E8E4D8]/60 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Slider / Scrub */}
        <div className="flex-1 flex items-center gap-3">
          <input
            type="range"
            min="1"
            max={book.totalPages}
            value={sliderVal}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSliderVal(val);
              onPageChange(val);
            }}
            className="w-full accent-[#5A5A40] cursor-pointer"
          />
          <div className="flex items-center gap-1 text-[11px] font-sans font-bold text-[#8C8471] uppercase tracking-wider whitespace-nowrap">
            <span className="text-[#1A1A1A]">{book.currentPage}</span>
            <span>/</span>
            <span>{book.totalPages}</span>
          </div>
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(Math.min(book.totalPages, book.currentPage + 1))}
          disabled={book.currentPage >= book.totalPages}
          className="p-2 rounded-full bg-[#FDFCF8] border border-[#DCD7C9] text-[#5A5A40] hover:bg-[#E8E4D8]/60 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full bg-[#FDFCF8] border border-[#DCD7C9] text-[#5A5A40] hover:bg-[#E8E4D8]/60 transition-all hidden sm:block shadow-xs"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </footer>
    </>
  );
};
