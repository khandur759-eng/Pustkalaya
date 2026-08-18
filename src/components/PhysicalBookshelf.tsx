import React, { useState } from 'react';
import { Book, ReaderSettings } from '../types';
import {
  BookOpen,
  Plus,
  Search,
  Bookmark as BookmarkIcon,
  Clock,
  Heart,
  Sliders,
  Library,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Download,
  Bell,
  User,
  Layers,
  Compass,
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';

interface PhysicalBookshelfProps {
  books: Book[];
  activeBookId: string;
  settings: ReaderSettings;
  onSelectBook: (book: Book) => void;
  onQuickResume: (bookId: string) => void;
  onOpenUpload: () => void;
  onOpenGlobalSettings: () => void;
  onDeleteBook: (bookId: string) => void;
  onToggleFavorite?: (bookId: string) => void;
  onUpdateSettings?: (newSettings: Partial<ReaderSettings>) => void;
}

export const PhysicalBookshelf: React.FC<PhysicalBookshelfProps> = ({
  books,
  activeBookId,
  settings,
  onSelectBook,
  onQuickResume,
  onOpenUpload,
  onOpenGlobalSettings,
  onDeleteBook,
  onToggleFavorite,
  onUpdateSettings,
}) => {
  const [navTab, setNavTab] = useState<'home' | 'library' | 'collections' | 'bookmarks'>('home');
  const [activeStatTab, setActiveStatTab] = useState<'all' | 'favorites' | 'recent' | 'downloads' | 'bookmarks'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeBook = books.find((b) => b.id === activeBookId) || books[0];

  // Filter books based on search, active quick tab, and category filter
  const filteredBooks = books.filter((b) => {
    if (activeStatTab === 'favorites' && !b.isFavorite) return false;
    if (activeStatTab === 'recent' && b.readingProgress <= 0) return false;
    if (activeStatTab === 'bookmarks' && (!b.bookmarks || b.bookmarks.length === 0)) return false;
    if (activeStatTab === 'downloads' && b.id !== 'book-alchemist') return false; // Sample downloads filter
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const favoritesCount = books.filter((b) => b.isFavorite).length;
  const bookmarksCount = books.reduce((acc, b) => acc + (b.bookmarks ? b.bookmarks.length : 0), 0);
  const recentCount = books.filter((b) => b.readingProgress > 0).length;
  const downloadsCount = Math.max(1, Math.floor(books.length / 2));

  // Visual styling for book covers (rich covers matching physical bindings)
  const getCoverStyling = (book: Book) => {
    switch (book.id) {
      case 'book-alchemist':
        return {
          bg: 'from-[#0D1829] via-[#15284F] to-[#0A1220]',
          border: 'border-amber-400/30',
          accent: 'text-amber-300',
          tag: 'CLASSIC',
        };
      case 'book-atomic-habits':
        return {
          bg: 'from-[#1C1C1E] via-[#2A2A2E] to-[#121214]',
          border: 'border-zinc-600',
          accent: 'text-zinc-200',
          tag: 'SELF-HELP',
        };
      case 'book-sapiens':
        return {
          bg: 'from-[#3A2A1A] via-[#523C24] to-[#241A10]',
          border: 'border-amber-500/30',
          accent: 'text-amber-200',
          tag: 'HISTORY',
        };
      case 'book-psychology-money':
        return {
          bg: 'from-[#0A2E1E] via-[#134931] to-[#061D13]',
          border: 'border-emerald-400/30',
          accent: 'text-emerald-300',
          tag: 'FINANCE',
        };
      case 'book-thinking-fast-slow':
        return {
          bg: 'from-[#222326] via-[#33343A] to-[#17181B]',
          border: 'border-indigo-400/30',
          accent: 'text-indigo-300',
          tag: 'SCIENCE',
        };
      case 'book-four-agreements':
        return {
          bg: 'from-[#38141D] via-[#521E2B] to-[#220B11]',
          border: 'border-rose-400/30',
          accent: 'text-rose-300',
          tag: 'WISDOM',
        };
      case 'book-ikigai':
        return {
          bg: 'from-[#18283B] via-[#233B57] to-[#0F1B29]',
          border: 'border-sky-400/30',
          accent: 'text-sky-300',
          tag: 'LIFESTYLE',
        };
      case 'book-deep-work':
        return {
          bg: 'from-[#2B161B] via-[#4A202A] to-[#1C0D11]',
          border: 'border-red-400/30',
          accent: 'text-red-300',
          tag: 'FOCUS',
        };
      default:
        return {
          bg: 'from-[#1E1B4B] via-[#312E81] to-[#0F172A]',
          border: 'border-indigo-400/30',
          accent: 'text-indigo-300',
          tag: 'EDITION',
        };
    }
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'fiction', label: 'Fiction' },
    { id: 'self-help', label: 'Self Help' },
    { id: 'business', label: 'Business' },
    { id: 'history', label: 'History' },
    { id: 'philosophy', label: 'Philosophy' },
    { id: 'classics', label: 'Classics' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#171B26] flex flex-col font-sans selection:bg-[#EEF0FF] selection:text-[#6677E8]">
      {/* ============================================================ */}
      {/* 1. TOP NAVIGATION (REFERENCE IMAGE 1) */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Wordmark */}
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={() => {
                setNavTab('home');
                setActiveStatTab('all');
                setCategoryFilter('all');
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] text-[#6677E8] group-hover:bg-[#6677E8] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs">
                <BookOpen className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-[#171B26]">
                Pustakalya
              </span>
            </div>

            {/* Center: Desktop Navigation Links with Restrained Periwinkle Active Accent */}
            <nav className="hidden md:flex items-center gap-2 text-xs font-medium">
              {[
                { id: 'home', label: 'Home' },
                { id: 'library', label: 'Library' },
                { id: 'collections', label: 'Collections' },
                { id: 'bookmarks', label: 'Bookmarks' },
              ].map((t) => {
                const isActive = navTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setNavTab(t.id as any);
                      if (t.id === 'bookmarks') setActiveStatTab('bookmarks');
                      else if (t.id === 'library') setActiveStatTab('all');
                    }}
                    className={`relative px-3.5 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'text-[#6677E8] font-semibold bg-[#EEF0FF]'
                        : 'text-[#667085] hover:text-[#171B26] hover:bg-[#F5F6FF]'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Notifications, Avatar & Add Book CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Input on Desktop */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="text"
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-[#F7F8FA] border border-[#E5E7EB] focus:bg-white focus:outline-none focus:border-[#6677E8] text-[#171B26] placeholder-[#98A2B3] transition-all"
              />
            </div>

            {/* Notifications Icon with subtle dot */}
            <button
              className="relative p-2 text-[#667085] hover:text-[#171B26] hover:bg-[#F7F8FA] rounded-full border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#6677E8]" />
            </button>

            {/* User Profile Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-[#EEF0FF] border border-[#E5E7EB] text-[#6677E8] text-xs font-semibold flex items-center justify-center select-none cursor-pointer"
              title="Signed in as Reader"
            >
              JD
            </div>

            {/* Add Book CTA */}
            <button
              onClick={() => {
                soundEngine.playPagePeelSound();
                onOpenUpload();
              }}
              className="px-4 py-1.5 bg-[#6677E8] hover:bg-[#5263DB] active:bg-[#4352B8] text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Book</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN CONTAINER */}
      {/* ============================================================ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-10">
        {/* Mobile Search Bar */}
        <div className="relative w-full sm:hidden">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input
            type="text"
            placeholder="Search books, authors, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-[#E5E7EB] focus:outline-none focus:border-[#6677E8] text-[#171B26] placeholder-[#98A2B3] shadow-xs"
          />
        </div>

        {/* ============================================================ */}
        {/* 2. BRIGHT EDITORIAL HERO (REFERENCE IMAGE 1) */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden rounded-3xl bg-white border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-12 transition-all">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14">
            {/* Left Headline & Supporting Copy */}
            <div className="space-y-5 max-w-xl text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF0FF] text-[#6677E8] text-[11px] font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#6677E8]" />
                <span>Editorial Digital Library</span>
              </div>

              {/* Large Display Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#171B26] tracking-tight leading-[1.12]">
                Every Page <br className="hidden sm:inline" />
                Tells a <span className="text-[#6677E8]">Story.</span>
              </h1>

              {/* Supporting Line */}
              <p className="text-base sm:text-lg text-[#667085] font-serif italic">
                Read. Feel. Remember.
              </p>

              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed max-w-md font-sans">
                Experience tactile physical books on your screen with realistic page turns, natural daylight paper tones, and ambient reading serenity.
              </p>

              {/* Primary CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <button
                  onClick={() => {
                    soundEngine.playPageFlipSound();
                    if (activeBook) onQuickResume(activeBook.id);
                  }}
                  className="px-7 py-3 bg-[#6677E8] hover:bg-[#5263DB] active:bg-[#4352B8] text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm shadow-[#6677E8]/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <span>Start Reading</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </button>

                <button
                  onClick={onOpenUpload}
                  className="px-5 py-3 bg-white hover:bg-[#F7F8FA] text-[#171B26] text-xs sm:text-sm font-medium rounded-full border border-[#E5E7EB] transition-colors cursor-pointer"
                >
                  Import Document
                </button>
              </div>
            </div>

            {/* Right: Realistic Open-Book / Daylight Composition Visual */}
            <div
              onClick={() => activeBook && onSelectBook(activeBook)}
              className="relative cursor-pointer z-10 shrink-0 transform hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
            >
              {/* Daylight Soft Shadow Box */}
              <div className="relative w-64 sm:w-80 h-72 sm:h-80 flex items-center justify-center">
                {/* Background Soft Shadow */}
                <div className="absolute inset-4 bg-[#E5E7EB] rounded-2xl filter blur-xl opacity-60 pointer-events-none" />

                {/* Open Physical Book Spread Illustration */}
                <div className="relative w-full h-56 sm:h-64 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_18px_45px_rgba(0,0,0,0.08)] flex overflow-hidden">
                  {/* Left Page */}
                  <div className="flex-1 p-5 border-r border-[#E5E7EB] bg-[#FCFBF9] flex flex-col justify-between select-none">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#98A2B3] font-semibold block">
                        Chapter 1
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#171B26] mt-1 leading-snug">
                        {activeBook ? activeBook.title : 'The Alchemist'}
                      </h4>
                      <p className="text-[10px] text-[#667085] mt-2 line-clamp-4 leading-relaxed font-serif">
                        “The boy's name was Santiago. Dusk was falling as the boy arrived with his herd at an abandoned church.”
                      </p>
                    </div>
                    <div className="text-[9px] text-[#98A2B3] font-mono">p. 1</div>
                  </div>

                  {/* Spine Center Shading */}
                  <div className="w-2.5 bg-gradient-to-r from-black/10 via-black/5 to-transparent pointer-events-none" />

                  {/* Right Page */}
                  <div className="flex-1 p-5 bg-[#FAF8F5] flex flex-col justify-between select-none">
                    <div>
                      <p className="text-[10px] text-[#667085] line-clamp-5 leading-relaxed font-serif">
                        “It was an enormous tree, and its roots were so deep that they seemed to hold the secrets of the earth.”
                      </p>
                      <div className="mt-3 w-8 h-8 rounded-full bg-[#EEF0FF] text-[#6677E8] flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#98A2B3]">
                      <span className="font-mono">p. 2</span>
                      <span className="text-[#6677E8] font-semibold flex items-center gap-0.5">
                        Open &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Subtle Hanging Ribbon Bookmark */}
                  <div className="absolute top-0 right-14 w-3.5 h-16 bg-[#6677E8] shadow-sm flex flex-col items-center">
                    <div className="w-0.5 h-full bg-white/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. CONTINUE READING SECTION (REFERENCE IMAGE 1) */}
        {/* ============================================================ */}
        {activeBook && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#171B26]">Continue Reading</h2>
              <span className="text-xs text-[#667085]">{activeBook.totalPages} pages total</span>
            </div>

            {/* Horizontal Continue Reading Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 shadow-xs hover:border-[#6677E8]/30 transition-all flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Left: Book Cover Preview */}
              <div
                onClick={() => onSelectBook(activeBook)}
                className="flex items-center gap-4 w-full sm:w-auto cursor-pointer group"
              >
                <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-lg bg-gradient-to-br from-[#1C2030] via-[#2A314B] to-[#121624] p-2.5 text-white shadow-md border border-white/10 flex flex-col justify-between shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-[7px] text-indigo-300 font-bold uppercase tracking-wider block truncate">
                    {activeBook.category || 'Featured'}
                  </span>
                  <p className="font-serif font-bold text-[11px] leading-tight line-clamp-2">
                    {activeBook.title}
                  </p>
                  <p className="text-[8px] text-zinc-300 truncate">{activeBook.author}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#171B26] group-hover:text-[#6677E8] transition-colors">
                    {activeBook.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#667085]">{activeBook.author}</p>
                  <span className="inline-block text-[10px] text-[#6677E8] font-semibold bg-[#EEF0FF] px-2 py-0.5 rounded-full">
                    {activeBook.category || 'General'}
                  </span>
                </div>
              </div>

              {/* Middle: Progress Info and Thin Bar */}
              <div className="w-full sm:max-w-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#667085]">
                  <span className="font-medium">
                    Page {activeBook.currentPage} of {activeBook.totalPages}
                  </span>
                  <span className="font-bold text-[#6677E8]">
                    {Math.round((activeBook.currentPage / Math.max(1, activeBook.totalPages)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#F7F8FA] h-1.5 rounded-full overflow-hidden border border-[#E5E7EB]">
                  <div
                    className="bg-[#6677E8] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, (activeBook.currentPage / Math.max(1, activeBook.totalPages)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Right: Resume Button */}
              <div className="w-full sm:w-auto flex justify-end">
                <button
                  onClick={() => {
                    soundEngine.playPageFlipSound();
                    onQuickResume(activeBook.id);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#6677E8] hover:bg-[#5263DB] active:bg-[#4352B8] text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Resume</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 4. YOUR LIBRARY & STAT CARDS (REFERENCE IMAGE 1) */}
        {/* ============================================================ */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#171B26]">Your Library</h2>
            <button
              onClick={onOpenGlobalSettings}
              className="text-xs text-[#667085] hover:text-[#171B26] flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>
          </div>

          {/* Stat Cards: All Books, Favorites, Recently Read, Downloads, Bookmarks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              {
                id: 'all',
                label: 'All Books',
                count: books.length,
                icon: <Library className="w-4 h-4" />,
                activeColor: 'bg-[#EEF0FF] text-[#6677E8]',
              },
              {
                id: 'favorites',
                label: 'Favorites',
                count: favoritesCount,
                icon: <Heart className="w-4 h-4 fill-current text-[#E05275]" />,
                activeColor: 'bg-[#FDF2F4] text-[#E05275]',
              },
              {
                id: 'recent',
                label: 'Recently Read',
                count: recentCount,
                icon: <Clock className="w-4 h-4 text-[#6677E8]" />,
                activeColor: 'bg-[#EEF0FF] text-[#6677E8]',
              },
              {
                id: 'downloads',
                label: 'Downloads',
                count: downloadsCount,
                icon: <Download className="w-4 h-4 text-[#6677E8]" />,
                activeColor: 'bg-[#EEF0FF] text-[#6677E8]',
              },
              {
                id: 'bookmarks',
                label: 'Bookmarks',
                count: bookmarksCount,
                icon: <BookmarkIcon className="w-4 h-4 text-[#6677E8]" />,
                activeColor: 'bg-[#EEF0FF] text-[#6677E8]',
              },
            ].map((stat) => {
              const isSelected = activeStatTab === stat.id;
              return (
                <button
                  key={stat.id}
                  onClick={() => {
                    setActiveStatTab(stat.id as any);
                    setCategoryFilter('all');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#6677E8] ring-1 ring-[#6677E8]/20 shadow-xs'
                      : 'bg-white border-[#E5E7EB] hover:border-[#D5D9E2] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 ${stat.activeColor}`}>
                    {stat.icon}
                  </div>
                  <div className="text-xl font-bold text-[#171B26]">{stat.count}</div>
                  <div className="text-xs text-[#667085] font-medium mt-0.5">{stat.label}</div>
                </button>
              );
            })}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {categories.map((cat) => {
              const isSelected = categoryFilter === cat.id && activeStatTab !== 'favorites';
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveStatTab('all');
                    setCategoryFilter(cat.id);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EEF0FF] text-[#6677E8] font-semibold border border-[#6677E8]/20 shadow-xs'
                      : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#171B26] hover:bg-[#F7F8FA]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* ============================================================ */}
          {/* 5. RECENTLY ADDED / BOOKS GALLERY (REFERENCE IMAGE 1) */}
          {/* ============================================================ */}
          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E7EB] space-y-2">
              <BookOpen className="w-8 h-8 text-[#98A2B3] mx-auto" />
              <p className="text-sm font-medium text-[#171B26]">No books found in this section</p>
              <p className="text-xs text-[#667085]">Try changing your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
              {filteredBooks.map((book) => {
                const style = getCoverStyling(book);
                const progress = Math.round((book.currentPage / Math.max(1, book.totalPages)) * 100);

                return (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book)}
                    className="group relative bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#6677E8]/40 p-3.5 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  >
                    {/* Realistic Book Cover Dominant Visual */}
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-[0_6px_16px_-4px_rgba(0,0,0,0.12)] group-hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.2)] transition-all duration-200 mb-3 bg-zinc-900 p-3.5 text-white flex flex-col justify-between">
                      {/* Rich Cover Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-95`} />

                      {/* Spine Shading */}
                      <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-black/40" />

                      {/* Inset Border */}
                      <div className={`absolute inset-2 border ${style.border} rounded-lg pointer-events-none`} />

                      {/* Favorite Button */}
                      {onToggleFavorite && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(book.id);
                          }}
                          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-black/35 backdrop-blur-xs flex items-center justify-center text-white hover:text-rose-400 transition-colors"
                          title={book.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              book.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white/80'
                            }`}
                          />
                        </button>
                      )}

                      {/* Tag / Category */}
                      <div className="z-10 pl-1.5 pt-0.5">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-300/80 font-bold">
                          {style.tag}
                        </span>
                      </div>

                      {/* Title & Author */}
                      <div className="z-10 pl-1.5">
                        <h3 className="font-serif font-bold text-sm sm:text-base leading-tight line-clamp-2 text-white">
                          {book.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-zinc-300 truncate mt-1">{book.author}</p>
                      </div>

                      {/* Bottom Open CTA */}
                      <div className="z-10 pl-1.5 flex items-center justify-between text-[9px] text-zinc-300 pt-2 border-t border-white/15">
                        <span>{book.totalPages} Pages</span>
                        <span className={`${style.accent} font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform`}>
                          Open &rarr;
                        </span>
                      </div>
                    </div>

                    {/* Metadata Below Cover */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6677E8] truncate">
                          {book.category || 'General'}
                        </span>
                        {progress > 0 && (
                          <span className="text-[10px] text-[#667085] font-medium">{progress}%</span>
                        )}
                      </div>
                      <h4 className="font-serif font-semibold text-sm text-[#171B26] truncate">
                        {book.title}
                      </h4>
                      <p className="text-xs text-[#667085] truncate">{book.author}</p>

                      {/* Progress Line */}
                      {progress > 0 && (
                        <div className="w-full bg-[#F7F8FA] h-1 rounded-full overflow-hidden mt-1.5 border border-[#E5E7EB]">
                          <div
                            className="bg-[#6677E8] h-full rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 6. EDITORIAL QUOTE / FOOTER ELEMENT (REFERENCE IMAGE 1) */}
        {/* ============================================================ */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E5E7EB] text-center space-y-3 relative overflow-hidden">
          <div className="text-4xl sm:text-5xl font-serif text-[#6677E8]/20 select-none leading-none">
            “
          </div>
          <p className="text-base sm:text-lg font-serif italic text-[#171B26] max-w-2xl mx-auto leading-relaxed -mt-3">
            “A reader lives a thousand lives before he dies. The man who never reads lives only one.”
          </p>
          <p className="text-xs font-semibold text-[#667085] tracking-wide font-sans">
            — George R.R. Martin
          </p>
        </div>
      </main>

      {/* ============================================================ */}
      {/* 7. MOBILE BOTTOM NAVIGATION */}
      {/* ============================================================ */}
      <nav className="sm:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-6 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            setNavTab('home');
            setActiveStatTab('all');
            setCategoryFilter('all');
          }}
          className={`flex flex-col items-center gap-1 py-1 ${
            navTab === 'home' ? 'text-[#6677E8] font-bold' : 'text-[#667085]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => {
            setNavTab('library');
            setActiveStatTab('all');
          }}
          className={`flex flex-col items-center gap-1 py-1 ${
            navTab === 'library' ? 'text-[#6677E8] font-bold' : 'text-[#667085]'
          }`}
        >
          <Library className="w-4 h-4" />
          <span className="text-[10px]">Library</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex flex-col items-center gap-1 py-1 text-[#6677E8]"
        >
          <div className="w-8 h-8 rounded-full bg-[#6677E8] text-white flex items-center justify-center -mt-3 shadow-md shadow-[#6677E8]/30">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-[10px]">Add</span>
        </button>

        <button
          onClick={() => {
            setActiveStatTab('favorites');
          }}
          className={`flex flex-col items-center gap-1 py-1 ${
            activeStatTab === 'favorites' ? 'text-[#E05275] font-bold' : 'text-[#667085]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-[10px]">Favorites</span>
        </button>

        <button
          onClick={onOpenGlobalSettings}
          className="flex flex-col items-center gap-1 py-1 text-[#667085]"
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[10px]">Settings</span>
        </button>
      </nav>
    </div>
  );
};
