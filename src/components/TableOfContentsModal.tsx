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
        className="relative w-full max-w-lg bg-white border border-[#E6E9EF] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E9EF] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] text-[#6677E8] flex items-center justify-center">
              <List className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#151923]">Table of Contents</h2>
              <p className="text-xs text-[#667085]">{book.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#98A2B3] hover:text-[#151923] hover:bg-white border border-transparent hover:border-[#E6E9EF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white font-sans">
          {/* Quick jump to cover */}
          <button
            onClick={() => {
              onSelectPage(1);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left border cursor-pointer ${
              currentPage === 1
                ? 'bg-[#EEF0FF] border-[#6677E8] text-[#151923]'
                : 'bg-white border-[#E6E9EF] hover:bg-[#F8FAFC] text-[#20242D]'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-[#6677E8]" />
              <span className="font-serif font-semibold text-sm">Cover Page</span>
            </div>
            <span className="text-xs text-[#667085]">Page 1</span>
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
                className={`w-full flex flex-col p-3 rounded-xl transition-all text-left border cursor-pointer ${
                  isCurrent
                    ? 'bg-[#EEF0FF] border-[#6677E8] text-[#151923] shadow-xs'
                    : 'bg-white border-[#E6E9EF] hover:bg-[#F8FAFC] hover:border-[#D5D9E2] text-[#20242D]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-serif font-semibold text-sm ${
                      isCurrent ? 'text-[#151923]' : 'text-[#20242D]'
                    }`}
                  >
                    {chapter.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs ${
                        isCurrent ? 'text-[#4B58C7] font-bold' : 'text-[#667085]'
                      }`}
                    >
                      Page {chapter.pageNumber}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${
                        isCurrent ? 'text-[#6677E8]' : 'text-[#98A2B3]'
                      }`}
                    />
                  </div>
                </div>

                {chapter.previewSnippet && (
                  <p className="text-xs text-[#667085] mt-1 line-clamp-1">
                    {chapter.previewSnippet}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
