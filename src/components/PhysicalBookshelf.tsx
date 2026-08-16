import React, { useState } from 'react';
import { Book } from '../types';
import {
  Library,
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Bookmark as BookmarkIcon,
  Clock,
  Trash2,
  Share2,
  Heart,
  FileText,
  UploadCloud,
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';

interface PhysicalBookshelfProps {
  books: Book[];
  activeBookId: string;
  onOpenBook: (bookId: string) => void;
  onOpenUpload: () => void;
  onDeleteBook: (bookId: string) => void;
  onToggleFavorite?: (bookId: string) => void;
}

export const PhysicalBookshelf: React.FC<PhysicalBookshelfProps> = ({
  books,
  activeBookId,
  onOpenBook,
  onOpenUpload,
  onDeleteBook,
  onToggleFavorite,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'favorites' | 'fiction' | 'classics'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeBook = books.find((b) => b.id === activeBookId) || books[0];

  const filteredBooks = books.filter((b) => {
    if (filterCategory === 'favorites' && !b.isFavorite) return false;
    if (filterCategory === 'fiction' && b.category !== 'fiction') return false;
    if (filterCategory === 'classics' && b.category !== 'classics') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    }
    return true;
  });

  const getCoverGradient = (theme: Book['coverTheme']) => {
    switch (theme) {
      case 'emerald-vintage':
        return 'from-[#1A382B] via-[#0E241B] to-[#07150F] text-[#E0ECE7] border-[#2A5240]';
      case 'navy-gold':
        return 'from-[#1B2838] via-[#101A26] to-[#080E17] text-[#E2E8F0] border-[#2E4259]';
      case 'burgundy-royal':
        return 'from-[#3D141A] via-[#280B10] to-[#170508] text-[#F5E6E8] border-[#5A232C]';
      case 'amber-antique':
        return 'from-[#422C1B] via-[#2C1C10] to-[#1A1008] text-[#F7EFE8] border-[#66472F]';
      case 'slate-minimal':
        return 'from-[#27272A] via-[#18181B] to-[#09090B] text-[#FAFAFA] border-[#3F3F46]';
      case 'classic-leather':
      default:
        return 'from-[#3A2D23] via-[#271E17] to-[#150F0A] text-[#F4ECE4] border-[#534032]';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-8 font-sans">
      {/* Bookshelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD7C9] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1 text-[#5A5A40]">
            <Library className="w-5 h-5" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase">DocuBook Library</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#1A1A1A]">
            The Collector's Bookshelf
          </h1>
          <p className="text-xs sm:text-sm text-[#8C8471] font-serif italic mt-1">
            Tactile physical volumes crafted for distraction-free reading.
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playPagePeelSound();
            onOpenUpload();
          }}
          className="px-5 py-3 rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] text-stone-100 text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Convert New Book
        </button>
      </div>

      {/* Hero "Currently Reading" Physical Volume */}
      {activeBook && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2C2C24] to-[#1B1B16] text-stone-100 p-6 sm:p-8 shadow-2xl border border-stone-700/40 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Ambient Lighting Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Book Details */}
          <div className="flex-1 space-y-3 z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Currently In Hand
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 leading-tight">
              {activeBook.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-serif">
              By <span className="text-stone-200 font-semibold">{activeBook.author}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-stone-400 font-sans pt-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Page {activeBook.currentPage} of {activeBook.totalPages}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{Math.max(1, Math.ceil((activeBook.totalPages - activeBook.currentPage) * 1.5))} min left</span>
              </div>
              <span>•</span>
              <span className="text-amber-300 font-medium">
                {Math.round((activeBook.currentPage / activeBook.totalPages) * 100)}% Read
              </span>
            </div>

            {/* Reading progress bar */}
            <div className="w-full max-w-md bg-stone-800 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(activeBook.currentPage / activeBook.totalPages) * 100}%` }}
              />
            </div>
          </div>

          {/* 3D Physical Book Thumbnail */}
          <div
            onClick={() => onOpenBook(activeBook.id)}
            className="group relative cursor-pointer z-10 shrink-0 transform hover:scale-105 transition-transform duration-300"
          >
            {/* Book Spine Shadow */}
            <div
              className={`w-36 sm:w-44 h-52 sm:h-64 rounded-r-xl rounded-l-xs bg-gradient-to-r ${getCoverGradient(
                activeBook.coverTheme
              )} border-2 shadow-[0_20px_40px_rgba(0,0,0,0.6)] p-4 flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Embossed gold border */}
              <div className="absolute inset-2 border border-amber-400/30 rounded-r-lg pointer-events-none" />

              {/* Hanging Bookmark Ribbon */}
              <div className="absolute top-0 right-4 w-3.5 h-12 bg-red-700 shadow-md rounded-b-xs" />

              {/* Spine edge */}
              <div className="absolute top-0 left-0 bottom-0 w-3 bg-black/40" />

              <div className="text-left pt-2">
                <span className="text-[9px] uppercase tracking-widest opacity-60 block">Hardcover</span>
                <span className="font-serif font-bold text-sm leading-tight line-clamp-2 mt-1">
                  {activeBook.title}
                </span>
              </div>

              <div className="text-left pb-1">
                <span className="text-[10px] opacity-75 font-sans block truncate">{activeBook.author}</span>
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block mt-1">
                  Tap to Open Book &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All Volumes' },
              { id: 'favorites', label: 'Favorites' },
              { id: 'classics', label: 'Classics' },
              { id: 'fiction', label: 'Original Works' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-[#5A5A40] text-stone-100 shadow-xs'
                  : 'bg-[#F4F1EA] text-[#8C8471] hover:text-[#1A1A1A] hover:bg-[#E8E4D8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8471]" />
          <input
            type="text"
            placeholder="Search titles or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-[#FDFCF8] border border-[#DCD7C9] focus:outline-none focus:border-[#5A5A40] text-[#1A1A1A]"
          />
        </div>
      </div>

      {/* Physical Wooden Bookshelf Grid */}
      <div className="relative pt-4">
        {/* Books Shelf Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pb-6">
          {filteredBooks.map((book) => {
            const progress = Math.round((book.currentPage / book.totalPages) * 100);

            return (
              <div
                key={book.id}
                className="group flex flex-col items-center select-none"
              >
                {/* 3D Standing Physical Book Cover */}
                <div
                  onClick={() => onOpenBook(book.id)}
                  className={`w-full max-w-[190px] h-[260px] rounded-r-xl rounded-l-xs bg-gradient-to-r ${getCoverGradient(
                    book.coverTheme
                  )} border-2 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer`}
                >
                  {/* Embossed insets */}
                  <div className="absolute inset-2 border border-stone-400/25 rounded-r-lg pointer-events-none" />

                  {/* Spine Ribs Left */}
                  <div className="absolute top-0 left-0 bottom-0 w-3 bg-black/40 flex flex-col justify-between py-4">
                    <div className="w-full h-0.5 bg-white/20" />
                    <div className="w-full h-0.5 bg-white/20" />
                    <div className="w-full h-0.5 bg-white/20" />
                  </div>

                  {/* Bookmark ribbon if has bookmark */}
                  {book.bookmarks.length > 0 && (
                    <div className="absolute top-0 right-3 w-3 h-8 bg-red-700 shadow-md rounded-b-xs" />
                  )}

                  {/* Top Book Category / Tag */}
                  <div className="pl-2 pt-1">
                    <span className="text-[8px] font-sans font-bold uppercase tracking-[0.2em] opacity-60">
                      {book.fileType === 'sample' ? 'Edition' : book.fileType.toUpperCase()}
                    </span>
                    <h3 className="font-serif font-bold text-sm sm:text-base leading-tight mt-1 line-clamp-3">
                      {book.title}
                    </h3>
                  </div>

                  {/* Bottom Author & Progress */}
                  <div className="pl-2 pb-1 space-y-1.5">
                    <p className="text-[11px] opacity-80 font-sans truncate">{book.author}</p>
                    <div className="flex items-center justify-between text-[9px] font-sans opacity-70">
                      <span>{book.totalPages} pages</span>
                      <span>{progress}%</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Book Metadata & Actions underneath the volume */}
                <div className="w-full max-w-[190px] mt-2 flex items-center justify-between text-xs px-1 text-[#8C8471]">
                  <span className="font-serif font-medium text-[11px] truncate">{book.title}</span>
                  <div className="flex items-center gap-1">
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(book.id);
                        }}
                        className="p-1 hover:text-red-600 transition-colors cursor-pointer"
                        title="Favorite"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-red-600 text-red-600' : 'text-stone-400'}`}
                        />
                      </button>
                    )}
                    {books.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove "${book.title}" from library?`)) {
                            onDeleteBook(book.id);
                          }
                        }}
                        className="p-1 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Book"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Realistic Wooden Shelf Ledge Bottom */}
        <div className="w-full h-4 bg-gradient-to-b from-[#8B653B] to-[#5C3F21] rounded-xs shadow-[0_8px_16px_rgba(0,0,0,0.3)] border-t border-[#A88050] relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>
    </div>
  );
};
