import React, { useState, useRef } from 'react';
import { Book } from '../types';
import { parseDocumentFile, createBookFromText } from '../utils/documentParser';
import { SAMPLE_BOOKS } from '../utils/sampleBooks';
import {
  Upload,
  FileText,
  BookOpen,
  Sparkles,
  X,
  Layers,
  Palette,
  FileUp,
  FileCheck,
  Loader2,
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreated: (book: Book) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onBookCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Form states for manual or customized upload
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [selectedCoverTheme, setSelectedCoverTheme] = useState<Book['coverTheme']>('classic-leather');
  const [density, setDensity] = useState<number>(250);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setProcessStep(`Reading ${file.name}...`);

      await new Promise((r) => setTimeout(r, 200));
      setProcessStep('Extracting document text & headings...');

      const book = await parseDocumentFile(file, {
        title: customTitle.trim() || undefined,
        author: customAuthor.trim() || undefined,
        wordsPerPage: density,
        coverTheme: selectedCoverTheme,
      });

      setProcessStep('Formatting pages and 3D digital book spread...');
      await new Promise((r) => setTimeout(r, 300));

      onBookCreated(book);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to parse file. Please try a different document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateFromPaste = () => {
    if (!pastedText.trim()) {
      setError('Please enter or paste some text for your book.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setProcessStep('Generating book from text...');

      const book = createBookFromText(pastedText, {
        title: customTitle.trim() || 'My Custom Book',
        author: customAuthor.trim() || 'Author',
        coverTheme: selectedCoverTheme,
        wordsPerPage: density,
        fileType: 'pasted',
      });

      onBookCreated(book);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error converting text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSample = (sample: Book) => {
    onBookCreated(sample);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FDFCF8] border border-[#DCD7C9] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD7C9] bg-[#F4F1EA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/30 flex items-center justify-center text-[#5A5A40]">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
                Convert Document to 3D Book
              </h2>
              <p className="text-xs text-[#8C8471] font-sans">
                Transform PDFs, Word files, or manuscripts into interactive flipbooks
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DCD7C9] bg-[#F4F1EA]/50 px-6 pt-2 font-sans">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#8C8471] hover:text-[#2C2C2C]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'paste'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#8C8471] hover:text-[#2C2C2C]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'samples'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#8C8471] hover:text-[#2C2C2C]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sample Classics
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCF8]">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isProcessing ? (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-[#5A5A40] animate-spin" />
                <BookOpen className="w-5 h-5 text-[#5A5A40] absolute inset-0 m-auto" />
              </div>
              <div>
                <h3 className="text-base font-serif font-semibold text-[#1A1A1A]">Generating Digital Flipbook</h3>
                <p className="text-xs text-[#8C8471] font-sans mt-1">{processStep}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tab 1: Upload File */}
              {activeTab === 'upload' && (
                <div className="space-y-4 font-sans">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      dragActive
                        ? 'border-[#5A5A40] bg-[#5A5A40]/10'
                        : 'border-[#DCD7C9] hover:border-[#5A5A40] bg-[#F4F1EA]/60 hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-full bg-[#E8E4D8] flex items-center justify-center text-[#5A5A40] shadow-xs">
                      <FileUp className="w-7 h-7 text-[#5A5A40]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2C2C2C]">
                        Drag and drop your document here, or <span className="text-[#5A5A40] underline font-bold">browse</span>
                      </p>
                      <p className="text-xs text-[#8C8471] mt-1">
                        Supports PDF (.pdf), Microsoft Word (.docx), Markdown (.md), Plain Text (.txt)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#E8E4D8] text-[10px] text-[#5A5A40] font-mono font-semibold">PDF</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#E8E4D8] text-[10px] text-[#5A5A40] font-mono font-semibold">DOCX</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#E8E4D8] text-[10px] text-[#5A5A40] font-mono font-semibold">TXT</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#E8E4D8] text-[10px] text-[#5A5A40] font-mono font-semibold">MD</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Paste Text */}
              {activeTab === 'paste' && (
                <div className="space-y-4 font-sans">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8C8471] mb-1.5">
                      Paste Article, Story, or Manuscript Text
                    </label>
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your text here. You can include Chapter headings like 'Chapter 1: The Beginning' or '# Introduction' for automatic Table of Contents generation..."
                      className="w-full h-44 p-3 bg-[#FDFCF8] border border-[#DCD7C9] rounded-xl text-[#2C2C2C] text-xs focus:outline-none focus:border-[#5A5A40] font-sans leading-relaxed resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Sample Classics */}
              {activeTab === 'samples' && (
                <div className="space-y-3 font-sans">
                  <p className="text-xs text-[#8C8471]">
                    Select a classic masterpiece to experience the 3D book animation instantly:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SAMPLE_BOOKS.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => handleSelectSample(book)}
                        className="p-4 rounded-xl border border-[#DCD7C9] bg-[#F4F1EA] hover:border-[#5A5A40] hover:bg-[#E8E4D8]/50 cursor-pointer transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] mb-2">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#1A1A1A] group-hover:text-[#5A5A40]">
                            {book.title}
                          </h4>
                          <p className="text-xs text-[#8C8471] mt-0.5">By {book.author}</p>
                        </div>
                        <div className="mt-4 pt-2 border-t border-[#DCD7C9] text-[11px] text-[#5A5A40] font-semibold flex items-center justify-between">
                          <span>{book.totalPages} pages</span>
                          <span>Open →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Customization Options (Available on Upload and Paste tabs) */}
              {activeTab !== 'samples' && (
                <div className="space-y-4 pt-4 border-t border-[#DCD7C9] font-sans">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C8471] flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-[#5A5A40]" />
                    Book Details & Formatting (Optional)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#8C8471] mb-1">Book Title (Optional override)</label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Auto-detected from file"
                        className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DCD7C9] rounded-lg text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#8C8471] mb-1">Author Name (Optional)</label>
                      <input
                        type="text"
                        value={customAuthor}
                        onChange={(e) => setCustomAuthor(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DCD7C9] rounded-lg text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-[#8C8471] mb-1">Page Density</label>
                      <select
                        value={density}
                        onChange={(e) => setDensity(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DCD7C9] rounded-lg text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40]"
                      >
                        <option value={180}>Compact (~180 words/page)</option>
                        <option value={250}>Balanced (~250 words/page - Standard)</option>
                        <option value={340}>Dense (~340 words/page)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8C8471] mb-1">Cover Theme</label>
                      <select
                        value={selectedCoverTheme}
                        onChange={(e) => setSelectedCoverTheme(e.target.value as Book['coverTheme'])}
                        className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DCD7C9] rounded-lg text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40]"
                      >
                        <option value="classic-leather">Classic Leather & Gold</option>
                        <option value="emerald-vintage">Emerald Vintage</option>
                        <option value="navy-gold">Navy Blue & Gold</option>
                        <option value="burgundy-royal">Burgundy Royal</option>
                        <option value="slate-minimal">Slate Minimalist</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#DCD7C9] bg-[#F4F1EA] font-sans">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#8C8471] hover:text-[#1A1A1A] hover:bg-[#E8E4D8] transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'paste' && (
            <button
              onClick={handleCreateFromPaste}
              disabled={isProcessing || !pastedText.trim()}
              className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#5A5A40] hover:bg-[#4A4A35] disabled:opacity-40 text-[#F4F1EA] transition-all flex items-center gap-2 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Build Digital Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
