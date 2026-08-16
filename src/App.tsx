import React, { useState, useEffect } from 'react';
import { Book, ReaderSettings, Bookmark } from './types';
import { SAMPLE_BOOKS } from './utils/sampleBooks';
import { BookViewer } from './components/BookViewer';
import { PhysicalBookshelf } from './components/PhysicalBookshelf';
import { ReaderHUD } from './components/ReaderHUD';
import { UploadModal } from './components/UploadModal';
import { TableOfContentsModal } from './components/TableOfContentsModal';
import { BookmarksModal } from './components/BookmarksModal';
import { BookSearchModal } from './components/BookSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { LibraryDrawer } from './components/LibraryDrawer';
import { soundEngine } from './utils/audioSynthesizer';

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'classic',
  paperTexture: 'cream',
  fontFamily: 'eb-garamond',
  fontSize: 16,
  lineHeight: 1.65,
  marginSize: 'normal',
  textAlign: 'justify',
  dropCaps: true,
  readingMode: 'spread',
  atmosphere: 'studio',
  deskSurface: 'dark-oak',
  soundEffects: true,
  ambientSound: 'none',
  ambientVolume: 0.4,
  autoFlip: false,
  autoFlipInterval: 8,
  showPageNumbers: true,
  enableKeyboardShortcuts: true,
  brightness: 100,
  reducedMotion: false,
};

const STORAGE_KEY_BOOKS = 'docubook_library_v2';
const STORAGE_KEY_SETTINGS = 'docubook_settings_v2';
const STORAGE_KEY_ACTIVE = 'docubook_active_book_v2';

export default function App() {
  // Navigation view mode: 'reader' or 'library'
  const [viewMode, setViewMode] = useState<'reader' | 'library'>('reader');
  const [isHUDVisible, setIsHUDVisible] = useState(true);
  const [isFullscreenReading, setIsFullscreenReading] = useState(false);

  // Load stored books or fall back to rich sample books
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SAMPLE_BOOKS;
  });

  const [activeBookId, setActiveBookId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved && books.some((b) => b.id === saved)) return saved;
    } catch {}
    return books[0]?.id || SAMPLE_BOOKS[0].id;
  });

  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Modal Dialog states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTOCOpen, setIsTOCOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLibraryDrawerOpen, setIsLibraryDrawerOpen] = useState(false);

  // Search query for page highlight
  const [searchQuery, setSearchQuery] = useState('');

  // Current active book object
  const activeBook = books.find((b) => b.id === activeBookId) || books[0] || SAMPLE_BOOKS[0];

  // Persist books to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    } catch (err) {
      console.warn('Storage quota exceeded or unavailable:', err);
    }
  }, [books]);

  // Persist active book ID
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeBookId);
    } catch {}
  }, [activeBookId]);

  // Sync ambient soundscape
  useEffect(() => {
    if (settings.ambientSound) {
      soundEngine.setAmbientSound(settings.ambientSound, settings.ambientVolume);
    }
  }, [settings.ambientSound, settings.ambientVolume]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Update current page of active book
  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, activeBook.totalPages));
    setBooks((prev) =>
      prev.map((b) =>
        b.id === activeBook.id
          ? {
              ...b,
              currentPage: clamped,
              readingProgress: Math.round((clamped / b.totalPages) * 100),
              updatedAt: Date.now(),
            }
          : b
      )
    );
  };

  // Add new book from upload or paste
  const handleBookCreated = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    setActiveBookId(newBook.id);
    setViewMode('reader');
    setIsUploadOpen(false);
  };

  // Delete book from library
  const handleDeleteBook = (bookId: string) => {
    if (books.length <= 1) return;
    const remaining = books.filter((b) => b.id !== bookId);
    setBooks(remaining);
    if (activeBookId === bookId) {
      setActiveBookId(remaining[0].id);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b))
    );
  };

  // Toggle bookmark on a given page
  const handleToggleBookmark = (pageNumber: number) => {
    const existingIndex = activeBook.bookmarks.findIndex((b) => b.pageNumber === pageNumber);

    let updatedBookmarks: Bookmark[];
    if (existingIndex >= 0) {
      // Remove
      updatedBookmarks = activeBook.bookmarks.filter((b) => b.pageNumber !== pageNumber);
    } else {
      // Add
      const page = activeBook.pages.find((p) => p.pageNumber === pageNumber);
      const snippet = page?.paragraphs[0]?.slice(0, 100) || `Bookmark on page ${pageNumber}`;

      const newBookmark: Bookmark = {
        id: 'bm-' + Date.now(),
        pageNumber,
        createdAt: Date.now(),
        previewText: snippet,
      };
      updatedBookmarks = [...activeBook.bookmarks, newBookmark];
      if (settings.soundEffects) {
        soundEngine.playBookmarkSound();
      }
    }

    setBooks((prev) =>
      prev.map((b) => (b.id === activeBook.id ? { ...b, bookmarks: updatedBookmarks } : b))
    );
  };

  // Remove specific bookmark by ID
  const handleRemoveBookmarkById = (bookmarkId: string) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === activeBook.id
          ? { ...b, bookmarks: b.bookmarks.filter((bm) => bm.id !== bookmarkId) }
          : b
      )
    );
  };

  // Add bookmark with note
  const handleAddBookmarkWithNote = (pageNumber: number, note?: string) => {
    const page = activeBook.pages.find((p) => p.pageNumber === pageNumber);
    const snippet = page?.paragraphs[0]?.slice(0, 100) || `Bookmark on page ${pageNumber}`;

    const newBookmark: Bookmark = {
      id: 'bm-' + Date.now(),
      pageNumber,
      note,
      createdAt: Date.now(),
      previewText: snippet,
    };

    setBooks((prev) =>
      prev.map((b) =>
        b.id === activeBook.id ? { ...b, bookmarks: [...b.bookmarks, newBookmark] } : b
      )
    );
  };

  // Add text highlight annotation
  const handleAddHighlight = (
    pageNumber: number,
    text: string,
    color: 'amber' | 'sage' | 'rose' | 'sky'
  ) => {
    const newHighlight = {
      id: 'hl-' + Date.now(),
      pageNumber,
      text,
      color,
      createdAt: Date.now(),
    };

    setBooks((prev) =>
      prev.map((b) =>
        b.id === activeBook.id
          ? { ...b, highlights: [...(b.highlights || []), newHighlight] }
          : b
      )
    );
  };

  // Update partial settings
  const handleUpdateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Search selection handler
  const handleSelectSearchResult = (pageNum: number, query: string) => {
    setSearchQuery(query);
    handlePageChange(pageNum);
  };

  const handleOpenBookFromShelf = (bookId: string) => {
    setActiveBookId(bookId);
    setViewMode('reader');
  };

  const handleToggleFullscreen = () => {
    setIsFullscreenReading((prev) => {
      const next = !prev;
      if (next) {
        try {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {}
      } else {
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {}
      }
      return next;
    });
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreenReading) {
        setIsFullscreenReading(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreenReading]);

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#121214] text-[#2C2C2C] dark:text-[#E2E2E2] flex flex-col justify-between selection:bg-[#5A5A40]/25 selection:text-[#5A5A40] font-serif transition-colors duration-300">
      {viewMode === 'library' ? (
        /* Bookshelf View */
        <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6">
          <PhysicalBookshelf
            books={books}
            activeBookId={activeBook.id}
            onOpenBook={handleOpenBookFromShelf}
            onOpenUpload={() => setIsUploadOpen(true)}
            onDeleteBook={handleDeleteBook}
            onToggleFavorite={handleToggleFavorite}
          />
        </main>
      ) : (
        /* Physical Real Book Reader Mode */
        <>
          {/* Floating HUD (hidden when in pure full screen mode) */}
          {!isFullscreenReading && (
            <ReaderHUD
              book={activeBook}
              settings={settings}
              isVisible={isHUDVisible}
              onPageChange={handlePageChange}
              onBackToLibrary={() => {
                setViewMode('library');
              }}
              onOpenTOC={() => setIsTOCOpen(true)}
              onOpenBookmarks={() => setIsBookmarksOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onToggleBookmark={handleToggleBookmark}
              onUpdateSettings={handleUpdateSettings}
              isFullscreen={isFullscreenReading}
              onToggleFullscreen={handleToggleFullscreen}
            />
          )}

          {/* Main 3D Book Stage */}
          <main
            className={`flex-1 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
              isFullscreenReading
                ? 'fixed inset-0 z-40 p-1 sm:p-3 bg-[#F4F1EA] dark:bg-[#121214] flex items-center justify-center'
                : 'p-2 sm:p-6 pb-20'
            }`}
          >
            {/* Natural Ambient Lighting Radial Glow */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, #DCD7C9 0%, transparent 70%)',
              }}
            />

            <BookViewer
              book={activeBook}
              settings={settings}
              onPageChange={handlePageChange}
              onToggleBookmark={handleToggleBookmark}
              onAddHighlight={handleAddHighlight}
              searchQuery={searchQuery}
              onToggleHUD={() => setIsHUDVisible((prev) => !prev)}
              isFullscreen={isFullscreenReading}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </main>
        </>
      )}

      {/* Modals and Drawers */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onBookCreated={handleBookCreated}
      />

      <TableOfContentsModal
        isOpen={isTOCOpen}
        onClose={() => setIsTOCOpen(false)}
        book={activeBook}
        currentPage={activeBook.currentPage}
        onSelectPage={handlePageChange}
      />

      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        book={activeBook}
        currentPage={activeBook.currentPage}
        onAddBookmark={handleAddBookmarkWithNote}
        onRemoveBookmark={handleRemoveBookmarkById}
        onSelectPage={handlePageChange}
      />

      <BookSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        book={activeBook}
        onSelectPage={handleSelectSearchResult}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <LibraryDrawer
        isOpen={isLibraryDrawerOpen}
        onClose={() => setIsLibraryDrawerOpen(false)}
        books={books}
        activeBookId={activeBook.id}
        onSelectBook={(id) => {
          setActiveBookId(id);
          setViewMode('reader');
        }}
        onDeleteBook={handleDeleteBook}
        onOpenUpload={() => setIsUploadOpen(true)}
      />
    </div>
  );
}
