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
        className="relative w-full max-w-md bg-[#FDFCF8] border-l border-[#DCD7C9] shadow-2xl h-full flex flex-col font-sans"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD7C9] bg-[#F4F1EA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/30 flex items-center justify-center text-[#5A5A40]">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1A1A]">My Bookshelf</h2>
              <p className="text-xs text-[#8C8471]">{books.length} converted books</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C8471] hover:text-[#1A1A1A] hover:bg-[#E8E4D8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action button */}
        <div className="p-4 border-b border-[#DCD7C9] bg-[#F4F1EA]/60">
          <button
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#5A5A40] hover:bg-[#4A4A35] text-[#F4F1EA] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Convert New Document
          </button>
        </div>

        {/* Books list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDFCF8]">
          {books.map((book: Book) => {
            const isActive = book.id === activeBookId;
            const progress = Math.round((book.currentPage / book.totalPages) * 100);

            return (
              <div
                key={book.id}
                className={`group relative p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-[#F4F1EA] border-[#5A5A40] shadow-xs'
                    : 'bg-[#F4F1EA]/40 border-[#DCD7C9] hover:border-[#5A5A40] hover:bg-[#F4F1EA]'
                }`}
              >
                <div
                  onClick={() => {
                    onSelectBook(book.id);
                    onClose();
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#1A1A1A] group-hover:text-[#5A5A40]">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#8C8471] mt-0.5 font-sans">By {book.author}</p>
                    </div>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E8E4D8] text-[#5A5A40] text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" />
                        Reading
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#8C8471] mb-3 font-sans">
                    <span>{book.totalPages} pages</span>
                    <span>•</span>
                    <span>{book.totalWords.toLocaleString()} words</span>
                    <span>•</span>
                    <span className="capitalize">{book.fileType}</span>
                  </div>

                  {/* Reading progress bar */}
                  <div className="w-full bg-[#E8E4D8] h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className="bg-[#5A5A40] h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8C8471] font-sans">
                    <span>Page {book.currentPage} of {book.totalPages}</span>
                    <span>{progress}% complete</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="mt-3 pt-3 border-t border-[#DCD7C9] flex items-center justify-between text-xs text-[#8C8471]">
                  <span className="flex items-center gap-1 text-[11px] text-[#8C8471]">
                    <Calendar className="w-3 h-3 text-[#5A5A40]" />
                    {new Date(book.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExportBook(book)}
                      className="p-1.5 rounded-lg hover:bg-[#E8E4D8] text-[#8C8471] hover:text-[#1A1A1A] transition-colors"
                      title="Download as Text"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {books.length > 1 && (
                      <button
                        onClick={() => onDeleteBook(book.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#8C8471] hover:text-red-700 transition-colors"
                        title="Remove from Shelf"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
