import React, { useState } from 'react';
import { Book, Bookmark } from '../types';
import { Bookmark as BookmarkIcon, X, Plus, Trash2, BookOpen } from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  currentPage: number;
  onAddBookmark: (pageNumber: number, note?: string) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
  onSelectPage: (pageNumber: number) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  book,
  currentPage,
  onAddBookmark,
  onRemoveBookmark,
  onSelectPage,
}) => {
  const [newNote, setNewNote] = useState('');
  const isCurrentBookmarked = book.bookmarks.some((b) => b.pageNumber === currentPage);

  if (!isOpen) return null;

  const handleAddCurrent = () => {
    onAddBookmark(currentPage, newNote.trim() || undefined);
    soundEngine.playBookmarkSound();
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FDFCF8] border border-[#DCD7C9] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD7C9] bg-[#F4F1EA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/30 flex items-center justify-center text-[#5A5A40]">
              <BookmarkIcon className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1A1A]">Ribbon Bookmarks</h2>
              <p className="text-xs text-[#8C8471] font-sans">
                {book.bookmarks.length} saved {book.bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C8471] hover:text-[#1A1A1A] hover:bg-[#E8E4D8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add bookmark for current page */}
        <div className="p-4 bg-[#F4F1EA]/60 border-b border-[#DCD7C9] font-sans">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#2C2C2C] font-semibold">
              Bookmark Current Page (<span className="font-sans font-bold text-[#5A5A40]">p. {currentPage}</span>)
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add optional note (e.g., 'Important quote')..."
              className="flex-1 px-3 py-2 bg-[#FDFCF8] border border-[#DCD7C9] rounded-xl text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40]"
            />
            <button
              onClick={handleAddCurrent}
              disabled={isCurrentBookmarked}
              className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#5A5A40] hover:bg-[#4A4A35] disabled:opacity-40 text-[#F4F1EA] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {isCurrentBookmarked ? 'Bookmarked' : 'Add'}
            </button>
          </div>
        </div>

        {/* List of bookmarks */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#FDFCF8] font-sans">
          {book.bookmarks.length === 0 ? (
            <div className="py-12 text-center text-[#8C8471] space-y-2">
              <BookmarkIcon className="w-8 h-8 mx-auto opacity-30 text-[#5A5A40]" />
              <p className="text-xs">No bookmarks saved yet in this book.</p>
            </div>
          ) : (
            book.bookmarks.map((bookmark: Bookmark) => (
              <div
                key={bookmark.id}
                className="group flex items-start justify-between p-3 rounded-xl bg-[#F4F1EA] border border-[#DCD7C9] hover:border-[#5A5A40] transition-all"
              >
                <div
                  onClick={() => {
                    onSelectPage(bookmark.pageNumber);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer pr-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#E8E4D8] text-[10px] font-sans font-bold text-[#5A5A40]">
                      Page {bookmark.pageNumber}
                    </span>
                    <span className="text-[11px] text-[#8C8471]">
                      {new Date(bookmark.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {bookmark.note && (
                    <p className="text-xs font-semibold text-[#1A1A1A] mb-1">
                      {bookmark.note}
                    </p>
                  )}

                  {bookmark.previewText && (
                    <p className="text-[11px] text-[#5A5A40] italic line-clamp-2 font-serif">
                      "{bookmark.previewText}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onSelectPage(bookmark.pageNumber);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-[#8C8471] hover:text-[#5A5A40] hover:bg-[#E8E4D8] transition-colors"
                    title="Jump to Page"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(bookmark.id)}
                    className="p-1.5 rounded-lg text-[#8C8471] hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Delete Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
