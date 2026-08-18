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
        className="relative w-full max-w-lg bg-white border border-[#E6E9EF] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E9EF] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] text-[#6677E8] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#151923]">Search in Book</h2>
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

        {/* Search input */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E6E9EF] font-sans">
          <div className="relative">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search words, phrases, characters, quotes..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E6E9EF] rounded-xl text-xs text-[#151923] focus:outline-none focus:border-[#6677E8]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#151923]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-white font-sans">
          {!searchTerm.trim() ? (
            <div className="py-12 text-center text-[#98A2B3] space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-40 text-[#6677E8]" />
              <p className="text-xs">Type a keyword or phrase to search throughout the book.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-[#98A2B3] space-y-2">
              <p className="text-sm font-semibold text-[#151923]">No matches found</p>
              <p className="text-xs">Try different search terms or check spelling.</p>
            </div>
          ) : (
            <>
              <div className="text-[11px] font-semibold text-[#667085] px-1 pb-1">
                Found {results.reduce((acc, r) => acc + r.count, 0)} results across {results.length} pages
              </div>

              {results.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelectPage(res.pageNumber, searchTerm);
                    onClose();
                  }}
                  className="w-full flex flex-col p-3 rounded-xl bg-white border border-[#E6E9EF] hover:border-[#6677E8]/40 hover:bg-[#F8FAFC] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#6677E8]">
                      Page {res.pageNumber} {res.chapterTitle ? `• ${res.chapterTitle}` : ''}
                    </span>
                    <span className="text-[10px] bg-[#EEF0FF] text-[#4B58C7] px-2 py-0.5 rounded-full font-bold">
                      {res.count} {res.count === 1 ? 'match' : 'matches'}
                    </span>
                  </div>

                  <p className="text-xs text-[#20242D] mt-1.5 line-clamp-2 leading-relaxed">
                    {res.snippet}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-[#6677E8] font-semibold mt-2 group-hover:translate-x-1 transition-transform">
                    <span>Jump to page</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
