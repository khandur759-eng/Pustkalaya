import React, { useState, useEffect } from 'react';
import { Book, ReaderSettings, PaperTexture } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  List,
  Bookmark as BookmarkIcon,
  Type,
  MoreVertical,
  BookOpen,
  Columns,
  Maximize2,
  Minimize2,
  Sliders,
  Palette,
  Sparkles,
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
  const [showTypographyPopover, setShowTypographyPopover] = useState(false);

  useEffect(() => {
    setSliderVal(book.currentPage);
  }, [book.currentPage]);

  const isBookmarked = book.bookmarks.some((b) => b.pageNumber === book.currentPage);
  const currentChapter = book.chapters
    .slice()
    .reverse()
    .find((c) => book.currentPage >= c.pageNumber);

  const progressPercent = Math.round((book.currentPage / Math.max(1, book.totalPages)) * 100);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. TOP HEADER (DESKTOP & MOBILE REFERENCE 2 & 3) */}
      {/* ============================================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-300 shadow-xs ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        {/* Left: Back to Library */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playPagePeelSound();
              onBackToLibrary();
            }}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#667085] hover:text-[#171B26] px-2 sm:px-3 py-1.5 rounded-full hover:bg-[#F7F8FA] border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Library</span>
          </button>
        </div>

        {/* Center: Book Title & Author (Gracefully Truncated) */}
        <div className="flex flex-col items-center text-center max-w-[180px] sm:max-w-md px-2 truncate">
          <span className="font-serif font-bold text-xs sm:text-base text-[#171B26] truncate">
            {book.title}
          </span>
          <span className="text-[10px] sm:text-xs text-[#667085] truncate">
            {book.author} {currentChapter ? `• ${currentChapter.title}` : ''}
          </span>
        </div>

        {/* Right: Reading Action Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search in Book */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-[#667085] hover:text-[#171B26] hover:bg-[#F7F8FA] rounded-full border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
            title="Search in Book"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Table of Contents */}
          <button
            onClick={onOpenTOC}
            className="p-2 text-[#667085] hover:text-[#171B26] hover:bg-[#F7F8FA] rounded-full border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
            title="Table of Contents"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Typography Settings Popover */}
          <div className="relative">
            <button
              onClick={() => setShowTypographyPopover(!showTypographyPopover)}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                showTypographyPopover
                  ? 'bg-[#EEF0FF] text-[#6677E8] border-[#6677E8]/30'
                  : 'text-[#667085] hover:text-[#171B26] hover:bg-[#F7F8FA] border-transparent hover:border-[#E5E7EB]'
              }`}
              title="Typography & Text Size"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Typography Popover */}
            {showTypographyPopover && (
              <div className="absolute right-0 top-full mt-2 w-64 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl z-50 space-y-3 font-sans">
                <div className="flex justify-between items-center text-xs font-semibold text-[#171B26]">
                  <span>Font Size</span>
                  <span className="text-[#6677E8] font-bold">{settings.fontSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#667085]">A</span>
                  <input
                    type="range"
                    min={14}
                    max={24}
                    step={1}
                    value={settings.fontSize}
                    onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value) })}
                    className="w-full accent-[#6677E8] h-1.5 bg-[#F7F8FA] rounded-lg cursor-pointer"
                  />
                  <span className="text-base font-bold text-[#171B26]">A</span>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB]">
                  <span className="text-xs font-semibold text-[#667085] block mb-2">
                    Typeface
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'garamond', label: 'Garamond', cls: 'font-serif' },
                      { id: 'playfair', label: 'Playfair', cls: 'font-serif' },
                      { id: 'cinzel', label: 'Cinzel', cls: 'font-serif' },
                      { id: 'sans', label: 'Modern', cls: 'font-sans' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onUpdateSettings({ fontFamily: f.id as any })}
                        className={`px-2.5 py-1 text-xs rounded-lg border text-left cursor-pointer ${f.cls} ${
                          settings.fontFamily === f.id
                            ? 'border-[#6677E8] bg-[#EEF0FF] text-[#6677E8] font-bold'
                            : 'border-[#E5E7EB] text-[#667085] hover:bg-[#F7F8FA]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => {
              if (settings.soundEffects) soundEngine.playBookmarkSound();
              onToggleBookmark(book.currentPage);
            }}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-[#E05275] bg-[#FDF2F4] border-[#E05275]/30'
                : 'text-[#667085] hover:text-[#171B26] hover:bg-[#F7F8FA] border-transparent hover:border-[#E5E7EB]'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Page'}
          >
            <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* More Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-[#667085] hover:text-[#171B26] hover:bg-[#F7F8FA] rounded-full border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
            title="All Settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MOBILE TOP SUB-BAR TOOLBAR (REFERENCE IMAGE 3) */}
      {/* ============================================================ */}
      <div
        className={`sm:hidden fixed top-14 left-0 right-0 z-30 px-4 py-2 flex items-center justify-between pointer-events-none transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        {/* Theme Button */}
        <button
          onClick={() => {
            const nextTheme = settings.paperTexture === 'dark' ? 'cream' : 'dark';
            onUpdateSettings({ paperTexture: nextTheme });
          }}
          className="pointer-events-auto px-3 py-1 rounded-full bg-white/95 shadow-md border border-[#E5E7EB] flex items-center gap-1.5 text-xs font-semibold text-[#171B26]"
        >
          <Palette className="w-3.5 h-3.5 text-[#6677E8]" />
          <span>{settings.paperTexture === 'dark' ? 'Light' : 'Theme'}</span>
        </button>

        {/* Page View / Layout Selector */}
        <button
          onClick={() => {
            const nextMode = settings.readingMode === 'single' ? 'spread' : 'single';
            onUpdateSettings({ readingMode: nextMode });
            soundEngine.playPagePeelSound();
          }}
          className="pointer-events-auto px-3 py-1 rounded-full bg-white/95 shadow-md border border-[#E5E7EB] flex items-center gap-1.5 text-xs font-semibold text-[#171B26]"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#6677E8]" />
          <span>{settings.readingMode === 'single' ? '1 Page' : '2 Pages'}</span>
        </button>

        {/* Contents Button */}
        <button
          onClick={onOpenTOC}
          className="pointer-events-auto px-3 py-1 rounded-full bg-white/95 shadow-md border border-[#E5E7EB] flex items-center gap-1.5 text-xs font-semibold text-[#171B26]"
          title="Contents"
        >
          <List className="w-3.5 h-3.5 text-[#6677E8]" />
          <span>TOC</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. FLOATING PAGE NAVIGATION CONTROLS (CIRCULAR CLEAN ARROWS) */}
      {/* ============================================================ */}
      <div className="hidden sm:flex fixed top-1/2 -translate-y-1/2 left-4 lg:left-6 z-30">
        <button
          onClick={() => onPageChange(Math.max(1, book.currentPage - (settings.readingMode === 'spread' ? 2 : 1)))}
          disabled={book.currentPage <= 1}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-[#E5E7EB] flex items-center justify-center text-[#667085] hover:text-[#6677E8] hover:border-[#6677E8]/40 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      <div className="hidden sm:flex fixed top-1/2 -translate-y-1/2 right-4 lg:right-6 z-30">
        <button
          onClick={() => onPageChange(Math.min(book.totalPages, book.currentPage + (settings.readingMode === 'spread' ? 2 : 1)))}
          disabled={book.currentPage >= book.totalPages}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-[#E5E7EB] flex items-center justify-center text-[#667085] hover:text-[#6677E8] hover:border-[#6677E8]/40 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 4. BOTTOM READING CONTROLS (DESKTOP & MOBILE REFERENCE 2 & 3) */}
      {/* ============================================================ */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] p-3 sm:px-8 sm:py-3 transition-all duration-300 shadow-md ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-2.5 font-sans">
          {/* Top Row: Title Preview, Page count, Slider Scrubber, Percentage & Controls */}
          <div className="flex items-center justify-between gap-4 text-xs font-semibold text-[#667085]">
            {/* Desktop Left: Title Preview */}
            <div className="hidden md:flex items-center gap-3 min-w-[180px]">
              <div className="w-6 h-8 rounded bg-[#1C2030] text-white flex items-center justify-center text-[8px] font-serif shadow-xs">
                {book.title[0]}
              </div>
              <div className="truncate">
                <p className="font-semibold text-xs text-[#171B26] truncate">{book.title}</p>
                <p className="text-[10px] text-[#667085] truncate">{book.author}</p>
              </div>
            </div>

            {/* Page Count */}
            <span className="text-xs font-bold text-[#171B26] whitespace-nowrap">
              Page {book.currentPage} of {book.totalPages}
            </span>

            {/* Slider Scrubber */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="1"
                max={book.totalPages}
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                onMouseUp={() => onPageChange(sliderVal)}
                onTouchEnd={() => onPageChange(sliderVal)}
                className="w-full accent-[#6677E8] h-1.5 bg-[#F7F8FA] rounded-lg cursor-pointer border border-[#E5E7EB]"
              />
            </div>

            {/* Percentage */}
            <span className="text-xs font-bold text-[#6677E8] whitespace-nowrap">
              {progressPercent}%
            </span>

            {/* Desktop Right Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => {
                  const nextMode = settings.readingMode === 'single' ? 'spread' : 'single';
                  onUpdateSettings({ readingMode: nextMode });
                  soundEngine.playPagePeelSound();
                }}
                className="px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#6677E8]/40 text-xs font-semibold text-[#171B26] hover:bg-[#F7F8FA] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Toggle View Mode"
              >
                {settings.readingMode === 'single' ? (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-[#6677E8]" />
                    <span>Single Page</span>
                  </>
                ) : (
                  <>
                    <Columns className="w-3.5 h-3.5 text-[#6677E8]" />
                    <span>Spread View</span>
                  </>
                )}
              </button>

              {onToggleFullscreen && (
                <button
                  onClick={onToggleFullscreen}
                  className="p-2 rounded-full border border-[#E5E7EB] hover:border-[#6677E8]/40 hover:bg-[#F7F8FA] text-[#667085] hover:text-[#171B26] transition-colors cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#6677E8]" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Bottom Bar (Reference Image 3: Contents, Progress, Theme, Layout, More) */}
          <div className="sm:hidden flex items-center justify-around pt-2 border-t border-[#E5E7EB] text-[#667085]">
            <button
              onClick={onOpenTOC}
              className="flex flex-col items-center gap-1 text-[10px] hover:text-[#6677E8] transition-colors"
            >
              <List className="w-4 h-4" />
              <span>Contents</span>
            </button>

            <button
              onClick={onOpenBookmarks}
              className="flex flex-col items-center gap-1 text-[10px] hover:text-[#6677E8] transition-colors"
            >
              <BookmarkIcon className="w-4 h-4" />
              <span>Bookmarks</span>
            </button>

            <button
              onClick={() => {
                const nextTheme = settings.paperTexture === 'dark' ? 'cream' : 'dark';
                onUpdateSettings({ paperTexture: nextTheme });
              }}
              className="flex flex-col items-center gap-1 text-[10px] hover:text-[#6677E8] transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Theme</span>
            </button>

            <button
              onClick={() => {
                const nextMode = settings.readingMode === 'single' ? 'spread' : 'single';
                onUpdateSettings({ readingMode: nextMode });
                soundEngine.playPagePeelSound();
              }}
              className="flex flex-col items-center gap-1 text-[10px] hover:text-[#6677E8] transition-colors"
            >
              <Columns className="w-4 h-4" />
              <span>Layout</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex flex-col items-center gap-1 text-[10px] hover:text-[#6677E8] transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
