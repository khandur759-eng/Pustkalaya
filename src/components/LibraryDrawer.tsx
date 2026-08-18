import React from 'react';
import { Book } from '../types';
import {
  Library,
  X,
  BookOpen,
  Plus,
  Trash2,
  Download,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface LibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  activeBookId: string;
  onSelectBook: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
  onOpenUpload: () => void;
}

export const LibraryDrawer: React.FC<LibraryDrawerProps> = ({
  isOpen,
  onClose,
  books,
  activeBookId,
  onSelectBook,
  onDeleteBook,
  onOpenUpload,
}) => {
  if (!isOpen) return null;

  const handleExportBook = (book: Book) => {
    const fullBookText = book.pages
      .filter((p) => !p.isCover && !p.isTableOfContents && !p.isBackCover)
      .map((p) => `${p.chapterTitle ? `\n\n--- ${p.chapterTitle} ---\n\n` : ''}${p.content}`)
      .join('\n\n');

    const blob = new Blob([`${book.title}\nBy ${book.author}\n\n${fullBookText}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Book.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white border-l border-[#E6E9EF] shadow-2xl h-full flex flex-col font-sans"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E9EF] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] text-[#6677E8] flex items-center justify-center">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#151923]">Library Shelf</h2>
              <p className="text-xs text-[#667085]">{books.length} converted books</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#98A2B3] hover:text-[#151923] hover:bg-white border border-transparent hover:border-[#E6E9EF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action button */}
        <div className="p-4 border-b border-[#E6E9EF] bg-[#F8FAFC]/50">
          <button
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#6677E8] hover:bg-[#5263DB] text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Document
          </button>
        </div>

        {/* Books list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {books.map((book: Book) => {
            const isActive = book.id === activeBookId;
            const progress = Math.round((book.currentPage / book.totalPages) * 100);

            return (
              <div
                key={book.id}
                className={`group relative p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-[#6677E8] bg-[#EEF0FF]/40 shadow-xs'
                    : 'border-[#E6E9EF] bg-white hover:border-[#D5D9E2] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => {
                      onSelectBook(book.id);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#151923] group-hover:text-[#6677E8] transition-colors">
                        {book.title}
                      </span>
                      {isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6677E8] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#667085] mt-0.5">{book.author}</p>

                    <div className="flex items-center gap-3 mt-3 text-[11px] text-[#667085]">
                      <span>{book.totalPages} pages</span>
                      <span>•</span>
                      <span className="font-semibold text-[#4B58C7]">
                        {progress}% read (p. {book.currentPage})
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#F3F5F8] h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-[#6677E8] h-full rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleExportBook(book)}
                      className="p-2 rounded-lg text-[#667085] hover:text-[#151923] hover:bg-white transition-colors"
                      title="Download as Text"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {books.length > 1 && (
                      <button
                        onClick={() => onDeleteBook(book.id)}
                        className="p-2 rounded-lg text-[#98A2B3] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove from Shelf"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
