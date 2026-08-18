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
        className="relative w-full max-w-lg bg-white border border-[#E6E9EF] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E9EF] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FDF2F4] text-[#E05275] flex items-center justify-center">
              <BookmarkIcon className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#151923]">Bookmarks</h2>
              <p className="text-xs text-[#667085] font-sans">
                {book.bookmarks.length} saved {book.bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#98A2B3] hover:text-[#151923] hover:bg-white border border-transparent hover:border-[#E6E9EF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add bookmark for current page */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E6E9EF] font-sans">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#20242D] font-semibold">
              Bookmark Current Page (<span className="text-[#6677E8] font-bold">p. {currentPage}</span>)
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add optional note (e.g., 'Important quote')..."
              className="flex-1 px-3 py-2 bg-white border border-[#E6E9EF] rounded-xl text-xs text-[#151923] focus:outline-none focus:border-[#6677E8]"
            />
            <button
              onClick={handleAddCurrent}
              disabled={isCurrentBookmarked}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6677E8] hover:bg-[#5263DB] disabled:opacity-40 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {isCurrentBookmarked ? 'Bookmarked' : 'Add'}
            </button>
          </div>
        </div>

        {/* List of bookmarks */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-white font-sans">
          {book.bookmarks.length === 0 ? (
            <div className="py-12 text-center text-[#98A2B3] space-y-2">
              <BookmarkIcon className="w-8 h-8 mx-auto opacity-40 text-[#6677E8]" />
              <p className="text-xs">No bookmarks saved yet in this book.</p>
            </div>
          ) : (
            book.bookmarks.map((bookmark: Bookmark) => (
              <div
                key={bookmark.id}
                className="group flex items-start justify-between p-3 rounded-xl bg-white border border-[#E6E9EF] hover:border-[#6677E8]/40 hover:bg-[#F8FAFC] transition-all"
              >
                <div
                  onClick={() => {
                    onSelectPage(bookmark.pageNumber);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer pr-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF0FF] text-[#4B58C7]">
                      Page {bookmark.pageNumber}
                    </span>
                    {bookmark.note && (
                      <span className="text-xs font-semibold text-[#151923] truncate">
                        {bookmark.note}
                      </span>
                    )}
                  </div>

                  {bookmark.previewText && (
                    <p className="text-xs text-[#667085] mt-1.5 italic line-clamp-2">
                      “{bookmark.previewText}”
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      onSelectPage(bookmark.pageNumber);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-[#6677E8] hover:bg-[#EEF0FF] transition-colors"
                    title="Go to Page"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(bookmark.id)}
                    className="p-1.5 rounded-lg text-[#98A2B3] hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove Bookmark"
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
