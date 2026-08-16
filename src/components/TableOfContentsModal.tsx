import React from 'react';
import { Book, Chapter } from '../types';
import { List, X, BookOpen, ChevronRight } from 'lucide-react';

interface TableOfContentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
}

export const TableOfContentsModal: React.FC<TableOfContentsModalProps> = ({
  isOpen,
  onClose,
  book,
  currentPage,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FDFCF8] border border-[#DCD7C9] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD7C9] bg-[#F4F1EA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/30 flex items-center justify-center text-[#5A5A40]">
              <List className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1A1A]">Table of Contents</h2>
              <p className="text-xs text-[#8C8471] font-sans">{book.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C8471] hover:text-[#1A1A1A] hover:bg-[#E8E4D8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FDFCF8] font-sans">
          {/* Quick jump to cover */}
          <button
            onClick={() => {
              onSelectPage(1);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left border ${
              currentPage === 1
                ? 'bg-[#5A5A40]/15 border-[#5A5A40] text-[#1A1A1A]'
                : 'bg-[#F4F1EA]/60 border-[#DCD7C9] hover:bg-[#F4F1EA] text-[#2C2C2C]'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-[#5A5A40]" />
              <span className="font-serif font-semibold text-sm">Cover Page</span>
            </div>
            <span className="text-xs font-sans text-[#8C8471]">Page 1</span>
          </button>

          {/* Chapters list */}
          {book.chapters.map((chapter: Chapter, idx: number) => {
            const isCurrent =
              currentPage >= chapter.pageNumber &&
              (idx === book.chapters.length - 1 || currentPage < book.chapters[idx + 1].pageNumber);

            return (
              <button
                key={chapter.id}
                onClick={() => {
                  onSelectPage(chapter.pageNumber);
                  onClose();
                }}
                className={`w-full flex flex-col p-3 rounded-xl transition-all text-left border ${
                  isCurrent
                    ? 'bg-[#5A5A40]/15 border-[#5A5A40] text-[#1A1A1A]'
                    : 'bg-[#F4F1EA]/60 border-[#DCD7C9] hover:border-[#5A5A40] hover:bg-[#F4F1EA] text-[#2C2C2C]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <span className="text-xs font-sans font-bold text-[#5A5A40]">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="font-serif font-medium text-sm truncate">{chapter.title}</span>
                  </div>
                  <span className="text-xs font-sans font-medium text-[#8C8471] shrink-0">
                    p. {chapter.pageNumber}
                  </span>
                </div>
                {chapter.previewSnippet && (
                  <p className="text-[11px] text-[#8C8471] line-clamp-1 mt-1 font-serif">
                    {chapter.previewSnippet}
                  </p>
                )}
              </button>
            );
          })}

          {/* Quick jump to back cover */}
          <button
            onClick={() => {
              onSelectPage(book.totalPages);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left border ${
              currentPage === book.totalPages
                ? 'bg-[#5A5A40]/15 border-[#5A5A40] text-[#1A1A1A]'
                : 'bg-[#F4F1EA]/60 border-[#DCD7C9] hover:bg-[#F4F1EA] text-[#2C2C2C]'
            }`}
          >
            <div className="flex items-center gap-3">
              <ChevronRight className="w-4 h-4 text-[#5A5A40]" />
              <span className="font-serif font-semibold text-sm">Conclusion / Finis</span>
            </div>
            <span className="text-xs font-sans text-[#8C8471]">Page {book.totalPages}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
