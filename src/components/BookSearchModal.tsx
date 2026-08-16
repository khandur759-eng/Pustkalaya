import React, { useState, useMemo } from 'react';
import { Book, PageData } from '../types';
import { Search, X, BookOpen, ArrowRight } from 'lucide-react';

interface BookSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onSelectPage: (pageNumber: number, query: string) => void;
}

export const BookSearchModal: React.FC<BookSearchModalProps> = ({
  isOpen,
  onClose,
  book,
  onSelectPage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Find occurrences across all pages
  const results = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];

    const query = searchTerm.toLowerCase();
    const matches: {
      pageNumber: number;
      chapterTitle?: string;
      snippet: string;
      count: number;
    }[] = [];

    book.pages.forEach((page: PageData) => {
      if (page.isCover) return;
      const lower = page.content.toLowerCase();
      let count = 0;
      let pos = 0;

      while ((pos = lower.indexOf(query, pos)) !== -1) {
        count++;
        pos += query.length;
      }

      if (count > 0) {
        // Find best snippet
        const firstPos = lower.indexOf(query);
        const start = Math.max(0, firstPos - 45);
        const end = Math.min(page.content.length, firstPos + query.length + 55);
        let snippet = page.content.slice(start, end).replace(/\s+/g, ' ');
        if (start > 0) snippet = '...' + snippet;
        if (end < page.content.length) snippet = snippet + '...';

        matches.push({
          pageNumber: page.pageNumber,
          chapterTitle: page.chapterTitle,
          snippet,
          count,
        });
      }
    });

    return matches;
  }, [searchTerm, book.pages]);

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
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1A1A]">Search in Book</h2>
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

        {/* Search input */}
        <div className="p-4 bg-[#F4F1EA]/60 border-b border-[#DCD7C9] font-sans">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8471] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search words, phrases, characters, quotes..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#FDFCF8] border border-[#DCD7C9] rounded-xl text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8471] hover:text-[#2C2C2C]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchTerm.length >= 2 && (
            <div className="mt-2 text-[11px] text-[#8C8471] flex items-center justify-between">
              <span>
                Found {results.reduce((acc, r) => acc + r.count, 0)} results across {results.length} pages
              </span>
            </div>
          )}
        </div>

        {/* Search results list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FDFCF8] font-sans">
          {!searchTerm.trim() ? (
            <div className="py-12 text-center text-[#8C8471] space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-30 text-[#5A5A40]" />
              <p className="text-xs">Type a keyword to search through all pages.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-[#8C8471] space-y-2">
              <p className="text-xs">No occurrences found for "{searchTerm}"</p>
            </div>
          ) : (
            results.map((result, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectPage(result.pageNumber, searchTerm);
                  onClose();
                }}
                className="w-full p-3 rounded-xl bg-[#F4F1EA] border border-[#DCD7C9] hover:border-[#5A5A40] hover:bg-[#E8E4D8]/60 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#E8E4D8] text-[#5A5A40] text-[10px] font-sans font-bold">
                      Page {result.pageNumber}
                    </span>
                    {result.chapterTitle && (
                      <span className="text-[11px] text-[#8C8471] font-medium truncate max-w-[200px]">
                        {result.chapterTitle}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#8C8471] group-hover:text-[#5A5A40] flex items-center gap-1 font-semibold">
                    Jump <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <p className="text-xs text-[#2C2C2C] font-serif leading-relaxed line-clamp-2">
                  {result.snippet}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
