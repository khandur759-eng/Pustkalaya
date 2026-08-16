import React, { useState, useEffect, useRef } from 'react';
import { PageData, ReaderSettings, Chapter, Book, Highlight } from '../types';
import { Bookmark as BookmarkIcon, BookOpen, Sparkles, CheckCircle2, Highlighter, Copy, Volume2, Check } from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';
import { VintageIllustration } from './VintageIllustrations';

interface PageContentProps {
  page: PageData | undefined;
  book: Book;
  settings: ReaderSettings;
  side: 'left' | 'right' | 'single';
  onNavigateToPage?: (pageNum: number) => void;
  searchQuery?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onAddHighlight?: (pageNumber: number, text: string, color: 'amber' | 'sage' | 'rose' | 'sky') => void;
}

export const PageContent: React.FC<PageContentProps> = ({
  page,
  book,
  settings,
  side,
  onNavigateToPage,
  searchQuery = '',
  isBookmarked = false,
  onToggleBookmark,
  onAddHighlight,
}) => {
  const [selectedText, setSelectedText] = useState('');
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Floating text selection popover
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setPopoverPos(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 2) {
        setPopoverPos(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = contentContainerRef.current?.getBoundingClientRect();

      if (containerRect && rect.top >= containerRect.top && rect.bottom <= containerRect.bottom + 50) {
        setSelectedText(text);
        setPopoverPos({
          x: Math.max(10, Math.min(rect.left + rect.width / 2 - containerRect.left, containerRect.width - 150)),
          y: Math.max(0, rect.top - containerRect.top - 44),
        });
      } else {
        setPopoverPos(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  if (!page) {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-30 select-none">
        <div className="text-center text-xs tracking-widest uppercase">Blank Page</div>
      </div>
    );
  }

  // Apply Highlight
  const handleHighlight = (color: 'amber' | 'sage' | 'rose' | 'sky') => {
    if (!selectedText || !page) return;
    if (settings.soundEffects) {
      soundEngine.playHighlightSound();
    }
    if (onAddHighlight) {
      onAddHighlight(page.pageNumber, selectedText, color);
    }
    window.getSelection()?.removeAllRanges();
    setPopoverPos(null);
    setSelectedText('');
  };

  // Copy selected text
  const handleCopyText = () => {
    if (!selectedText) return;
    navigator.clipboard.writeText(selectedText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setPopoverPos(null);
      window.getSelection()?.removeAllRanges();
    }, 1000);
  };

  // Speak selection
  const handleSpeakSelection = () => {
    if (!selectedText || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(selectedText);
    window.speechSynthesis.speak(utter);
    setPopoverPos(null);
  };

  // Cover Page
  if (page.isCover) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-6 sm:p-12 text-center select-none relative overflow-hidden bg-inherit">
        {/* Decorative corner borders */}
        <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-stone-500/40" />
        <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-stone-500/40" />
        <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-stone-500/40" />
        <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-stone-500/40" />

        {/* Vintage Top Motif */}
        <div className="pt-4 flex flex-col items-center gap-1.5">
          <div className="w-16 h-0.5 bg-stone-500/50 mb-1" />
          <span className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase opacity-70">
            Collector's Edition
          </span>
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <span className="text-xs">✦</span>
            <span className="text-xs">✦</span>
            <span className="text-xs">✦</span>
          </div>
        </div>

        {/* Title & Author */}
        <div className="my-auto px-4 max-w-md">
          <h1
            className="text-3xl sm:text-5xl font-serif font-medium tracking-tight mb-4 leading-tight"
            style={{
              fontFamily:
                settings.fontFamily === 'cinzel'
                  ? "'Cinzel', serif"
                  : settings.fontFamily === 'playfair'
                  ? "'Playfair Display', serif"
                  : "'EB Garamond', serif",
            }}
          >
            {book.title}
          </h1>

          <div className="w-24 h-0.5 bg-stone-400/40 mx-auto my-5 rounded-full" />

          <p className="text-xs sm:text-sm font-sans font-semibold tracking-[0.2em] uppercase text-stone-700 dark:text-stone-300">
            By {book.author}
          </p>

          {book.coverSubtitle && (
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 italic font-serif tracking-wide">
              {book.coverSubtitle}
            </p>
          )}
        </div>

        {/* Bottom Details */}
        <div className="pb-4 text-xs opacity-75 flex flex-col items-center gap-2 font-sans">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold">
            <span>{book.totalPages} Pages</span>
            <span>•</span>
            <span>{book.totalWords.toLocaleString()} Words</span>
          </div>
          {onNavigateToPage && (
            <button
              onClick={() => onNavigateToPage(2)}
              className="mt-3 px-6 py-2 rounded-full text-xs font-sans font-semibold tracking-wider uppercase bg-[#5A5A40] hover:bg-[#4A4A35] text-stone-100 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Open Book
            </button>
          )}
        </div>
      </div>
    );
  }

  // Table of Contents Page
  if (page.isTableOfContents) {
    return (
      <div className="w-full h-full flex flex-col p-5 sm:p-9 select-none overflow-hidden bg-inherit">
        <div className="text-center pb-3 border-b border-stone-300/60 dark:border-stone-700/60 mb-3">
          <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold block mb-1 opacity-70">
            Contents
          </span>
          <h2
            className="text-xl sm:text-2xl font-serif font-medium"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Table of Contents
          </h2>
          <p className="text-xs italic font-serif opacity-75">Index of Chapters & Sections</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 my-auto">
          {book.chapters.map((chapter: Chapter, idx: number) => (
            <button
              key={chapter.id}
              onClick={() => onNavigateToPage && onNavigateToPage(chapter.pageNumber)}
              className="w-full text-left group flex items-baseline justify-between py-1.5 px-2 rounded-lg hover:bg-stone-500/10 transition-colors cursor-pointer"
            >
              <div className="flex items-baseline gap-2 overflow-hidden mr-2">
                <span className="text-xs font-sans font-bold text-[#5A5A40] dark:text-amber-400 shrink-0">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span className="text-sm font-serif font-medium truncate group-hover:text-[#5A5A40] dark:group-hover:text-amber-300">
                  {chapter.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-sans">
                <span className="hidden sm:inline border-b border-dotted border-stone-400/40 w-12" />
                <span className="text-xs font-medium opacity-70 group-hover:opacity-100">
                  p. {chapter.pageNumber}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2 text-center text-xs font-sans opacity-60 border-t border-stone-300/60 dark:border-stone-700/60">
          Page 3
        </div>
      </div>
    );
  }

  // Back Cover / Finis Page
  if (page.isBackCover) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-6 sm:p-12 text-center select-none relative overflow-hidden bg-inherit">
        <div className="absolute inset-4 border-2 border-stone-300/50 dark:border-stone-700/50 rounded pointer-events-none" />

        <div className="pt-4">
          <Sparkles className="w-7 h-7 text-[#5A5A40] dark:text-amber-400 mx-auto mb-2 opacity-80" />
          <h2
            className="text-2xl sm:text-3xl font-serif font-medium tracking-wider mb-1"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Finis
          </h2>
          <p className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold opacity-70">
            End of the Volume
          </p>
        </div>

        <div className="my-auto space-y-4 max-w-sm px-4">
          <div className="w-12 h-12 rounded-full bg-stone-500/15 text-[#5A5A40] dark:text-amber-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold">You've completed this volume!</h3>
          <p className="text-xs font-serif leading-relaxed opacity-85">
            Finished reading <span className="font-semibold">{book.title}</span> by {book.author}.
          </p>

          <div className="grid grid-cols-2 gap-2 text-left bg-stone-500/10 p-3 rounded-lg border border-stone-300/40 dark:border-stone-700/40 text-xs font-sans">
            <div>
              <span className="opacity-70 text-[10px] uppercase font-bold tracking-wider block">Pages Read</span>
              <span className="font-semibold text-sm">{book.totalPages} pages</span>
            </div>
            <div>
              <span className="opacity-70 text-[10px] uppercase font-bold tracking-wider block">Total Words</span>
              <span className="font-semibold text-sm">{book.totalWords.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="pb-4 flex flex-col gap-2 items-center font-sans">
          {onNavigateToPage && (
            <button
              onClick={() => onNavigateToPage(1)}
              className="px-5 py-2 rounded-full text-xs font-sans font-semibold uppercase tracking-wider bg-[#5A5A40] hover:bg-[#4A4A35] text-stone-100 transition-all cursor-pointer shadow-sm"
            >
              Read Again from Beginning
            </button>
          )}
          <span className="text-[10px] opacity-60 uppercase tracking-widest">DocuBook Physical Reader</span>
        </div>
      </div>
    );
  }

  // Standard Content Page
  const isFirstPageOfChapter = page.chapterTitle && page.paragraphs.length > 0;
  const fontClass =
    settings.fontFamily === 'merriweather'
      ? 'font-serif'
      : settings.fontFamily === 'eb-garamond'
      ? 'font-serif'
      : settings.fontFamily === 'playfair'
      ? 'font-serif'
      : settings.fontFamily === 'cinzel'
      ? 'font-serif'
      : settings.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const fontStyle = {
    fontFamily:
      settings.fontFamily === 'merriweather'
        ? "'Merriweather', Georgia, serif"
        : settings.fontFamily === 'eb-garamond'
        ? "'EB Garamond', Garamond, serif"
        : settings.fontFamily === 'playfair'
        ? "'Playfair Display', serif"
        : settings.fontFamily === 'cinzel'
        ? "'Cinzel', serif"
        : settings.fontFamily === 'mono'
        ? "'JetBrains Mono', monospace"
        : "'Plus Jakarta Sans', sans-serif",
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
  };

  const marginClass =
    settings.marginSize === 'compact'
      ? 'p-4 sm:p-6'
      : settings.marginSize === 'spacious'
      ? 'p-8 sm:p-11'
      : 'p-5 sm:p-8';

  // Render paragraph with search matching
  const renderParagraph = (text: string, pIndex: number) => {
    const isFirst = pIndex === 0 && settings.dropCaps && isFirstPageOfChapter;

    if (!searchQuery || !searchQuery.trim()) {
      return (
        <p
          key={pIndex}
          className={`mb-3.5 leading-relaxed ${settings.textAlign === 'justify' ? 'text-justify' : 'text-left'} ${
            isFirst ? 'drop-cap' : ''
          }`}
        >
          {text}
        </p>
      );
    }

    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <p
        key={pIndex}
        className={`mb-3.5 leading-relaxed ${settings.textAlign === 'justify' ? 'text-justify' : 'text-left'}`}
      >
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark
              key={i}
              className="bg-amber-300 dark:bg-amber-500 text-stone-900 font-bold px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </p>
    );
  };

  return (
    <div
      ref={contentContainerRef}
      className={`w-full h-full flex flex-col justify-between ${marginClass} select-text relative overflow-hidden bg-inherit`}
    >
      {/* Floating Highlighter / Action Popover when selecting text */}
      {popoverPos && (
        <div
          className="absolute z-50 bg-[#2C2C2C] text-white px-2.5 py-1.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-sans animate-in fade-in zoom-in-95 duration-150"
          style={{ left: `${popoverPos.x}px`, top: `${popoverPos.y}px` }}
        >
          <span className="text-[10px] uppercase font-bold text-stone-400">Mark</span>
          <button
            onClick={() => handleHighlight('amber')}
            title="Amber Highlight"
            className="w-4 h-4 rounded-full bg-amber-400 hover:scale-125 transition-transform cursor-pointer shadow-xs"
          />
          <button
            onClick={() => handleHighlight('sage')}
            title="Sage Highlight"
            className="w-4 h-4 rounded-full bg-emerald-400 hover:scale-125 transition-transform cursor-pointer shadow-xs"
          />
          <button
            onClick={() => handleHighlight('rose')}
            title="Rose Highlight"
            className="w-4 h-4 rounded-full bg-rose-400 hover:scale-125 transition-transform cursor-pointer shadow-xs"
          />
          <button
            onClick={() => handleHighlight('sky')}
            title="Sky Highlight"
            className="w-4 h-4 rounded-full bg-sky-400 hover:scale-125 transition-transform cursor-pointer shadow-xs"
          />
          <div className="w-px h-3 bg-stone-600 my-auto" />
          <button
            onClick={handleCopyText}
            title="Copy Text"
            className="text-stone-300 hover:text-white p-0.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleSpeakSelection}
            title="Read Selection Aloud"
            className="text-stone-300 hover:text-white p-0.5 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Ribbon Bookmark Button in top corner */}
      {onToggleBookmark && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          title={isBookmarked ? 'Remove Bookmark' : 'Add Ribbon Bookmark'}
          className={`absolute top-0 ${side === 'left' ? 'left-6' : 'right-6'} z-20 transition-all cursor-pointer ${
            isBookmarked ? 'opacity-100 -translate-y-0.5' : 'opacity-20 hover:opacity-75'
          }`}
        >
          <div
            className={`w-6 h-9 flex items-center justify-center rounded-b-sm shadow-md transition-colors ${
              isBookmarked ? 'bg-red-700 text-white ribbon-bookmark' : 'bg-stone-400 text-stone-800'
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5 fill-current" />
          </div>
        </button>
      )}

      {/* Header Running Head */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-300/60 dark:border-stone-700/60 text-[10px] uppercase tracking-[0.3em] font-sans font-bold opacity-70 select-none">
        <span className="truncate max-w-[140px] sm:max-w-[220px]">
          {side === 'left' ? book.title : page.chapterTitle ? `${page.chapterIndex ? `Ch. ${page.chapterIndex} • ` : ''}${page.chapterTitle}` : book.title}
        </span>
        <span className="font-sans font-medium text-[11px]">
          {page.pageNumber}
        </span>
      </div>

      {/* Chapter Title Headline if chapter begins on this page */}
      {page.chapterTitle && (
        <div className="text-left mb-3">
          <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold block mb-1 text-[#5A5A40] dark:text-amber-400">
            {page.chapterIndex ? `Chapter ${page.chapterIndex}` : 'Section'}
          </span>
          <h1
            className="text-xl sm:text-3xl leading-tight font-serif font-medium"
            style={{
              fontFamily:
                settings.fontFamily === 'cinzel'
                  ? "'Cinzel', serif"
                  : settings.fontFamily === 'playfair'
                  ? "'Playfair Display', serif"
                  : "'EB Garamond', serif",
            }}
          >
            {page.chapterTitle}
          </h1>
        </div>
      )}

      {/* Optional Vintage Illustration Engraving */}
      {page.illustration && (
        <VintageIllustration type={page.illustration} />
      )}

      {/* Optional Blockquote */}
      {page.quote && (
        <div className="my-3 px-4 py-2.5 border-l-2 border-[#5A5A40] dark:border-amber-400/80 bg-stone-500/5 rounded-r-lg font-serif italic text-xs sm:text-sm">
          <p className="leading-relaxed">"{page.quote}"</p>
          {page.quoteAuthor && (
            <p className="text-right text-[10px] uppercase font-sans tracking-wider not-italic mt-1.5 opacity-75">
              — {page.quoteAuthor}
            </p>
          )}
        </div>
      )}

      {/* Body Content */}
      <div
        className={`flex-1 overflow-y-auto pr-1 ${fontClass}`}
        style={fontStyle}
      >
        {page.paragraphs.map((p, idx) => renderParagraph(p, idx))}
      </div>

      {/* Optional Footnote */}
      {page.footnote && (
        <div className="pt-2 mt-2 border-t border-stone-300/40 dark:border-stone-700/40 text-[10px] italic font-serif opacity-75">
          {page.footnote}
        </div>
      )}

      {/* Footer Page Number & Details */}
      {settings.showPageNumbers && (
        <div className="pt-2 mt-1 border-t border-stone-300/60 dark:border-stone-700/60 flex items-center justify-between text-xs font-sans opacity-70 font-medium select-none">
          <span>
            {page.wordCount} words
          </span>
          <span>
            {page.pageNumber}
          </span>
        </div>
      )}
    </div>
  );
};
