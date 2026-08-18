import React from 'react';
import { Book, ReaderSettings, PaperTexture, AtmosphereTheme, DeskSurface } from '../types';
import {
  BookOpen,
  X,
  Type,
  Layout,
  Sun,
  Flame,
  CloudRain,
  Moon,
  Check,
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';

interface PreReadingModalProps {
  isOpen: boolean;
  book: Book | null;
  settings: ReaderSettings;
  atmosphere: AtmosphereTheme;
  deskSurface: DeskSurface;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
  onUpdateAtmosphere: (atm: AtmosphereTheme) => void;
  onUpdateDeskSurface: (surf: DeskSurface) => void;
  onClose: () => void;
  onConfirmOpenBook: () => void;
}

export const PreReadingModal: React.FC<PreReadingModalProps> = ({
  isOpen,
  book,
  settings,
  atmosphere,
  deskSurface,
  onUpdateSettings,
  onUpdateAtmosphere,
  onUpdateDeskSurface,
  onClose,
  onConfirmOpenBook,
}) => {
  if (!isOpen || !book) return null;

  const paperThemes: { id: PaperTexture; label: string; bg: string; text: string; border: string }[] = [
    { id: 'cream', label: 'Classic Cream', bg: '#FDFCF8', text: '#171B26', border: '#E5E7EB' },
    { id: 'parchment', label: 'Parchment', bg: '#F5EEDB', text: '#18130B', border: '#D8CAA8' },
    { id: 'washi', label: 'Washi Paper', bg: '#FAF7EE', text: '#141210', border: '#E2DDD1' },
    { id: 'linen', label: 'Linen Fiber', bg: '#F4EFE6', text: '#110F0D', border: '#DFD8CC' },
    { id: 'sepia', label: 'Antique Sepia', bg: '#EFE6D5', text: '#221508', border: '#D9CDBA' },
    { id: 'dark', label: 'Obsidian Dark', bg: '#18181B', text: '#F4F4F5', border: '#3F3F46' },
  ];

  const atmospheres: { id: AtmosphereTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'studio', label: 'Soft Daylight', icon: <Sun className="w-4 h-4 text-[#6677E8]" /> },
    { id: 'candlelight', label: 'Candlelight', icon: <Flame className="w-4 h-4 text-orange-500" /> },
    { id: 'rainstorm', label: 'Rainy Library', icon: <CloudRain className="w-4 h-4 text-sky-500" /> },
    { id: 'night', label: 'Midnight', icon: <Moon className="w-4 h-4 text-indigo-500" /> },
  ];

  const fonts = [
    { id: 'garamond', label: 'EB Garamond', fontClass: 'font-serif' },
    { id: 'playfair', label: 'Playfair Display', fontClass: 'font-serif' },
    { id: 'cinzel', label: 'Cinzel Classic', fontClass: 'font-serif' },
    { id: 'sans', label: 'Modern Sans', fontClass: 'font-sans' },
  ];

  const handleStart = () => {
    soundEngine.playPageFlipSound();
    onConfirmOpenBook();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Book Summary */}
        <div className="p-6 border-b border-[#E5E7EB] bg-[#F7F8FA] flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-20 rounded-lg shadow-sm bg-gradient-to-br from-[#1C2030] to-[#121624] text-white flex flex-col justify-between p-2 border border-white/10 shrink-0">
              <span className="text-[8px] uppercase tracking-widest text-[#EEF0FF] font-semibold truncate">
                {book.category || 'Volume'}
              </span>
              <div>
                <p className="font-serif text-[10px] font-bold leading-tight line-clamp-2">{book.title}</p>
                <p className="text-[8px] text-zinc-300 truncate mt-0.5">{book.author}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#EEF0FF] text-[#6677E8]">
                  Ready to Read
                </span>
                <span className="text-xs text-[#667085]">
                  {book.totalPages} Pages • {book.chapters.length} Chapters
                </span>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#171B26] mt-1">{book.title}</h2>
              <p className="text-sm text-[#667085]">By {book.author}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#98A2B3] hover:text-[#171B26] rounded-full hover:bg-white border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Page Display Mode */}
          <div>
            <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2.5">
              Reading Layout
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({ readingMode: 'single' });
                  soundEngine.playPagePeelSound();
                }}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.readingMode === 'single'
                    ? 'border-[#6677E8] bg-[#EEF0FF]/50 text-[#171B26] ring-2 ring-[#6677E8]/20'
                    : 'border-[#E5E7EB] bg-white hover:border-[#D5D9E2] text-[#171B26]'
                }`}
              >
                <div className="w-7 h-9 rounded border-2 border-current flex items-center justify-center text-xs font-serif font-bold opacity-80">
                  1
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#171B26]">Single Page</div>
                  <div className="text-xs text-[#667085]">Distraction-free focus view</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({ readingMode: 'spread' });
                  soundEngine.playPagePeelSound();
                }}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.readingMode === 'spread'
                    ? 'border-[#6677E8] bg-[#EEF0FF]/50 text-[#171B26] ring-2 ring-[#6677E8]/20'
                    : 'border-[#E5E7EB] bg-white hover:border-[#D5D9E2] text-[#171B26]'
                }`}
              >
                <div className="w-9 h-9 rounded border-2 border-current flex items-center justify-center text-xs font-serif font-bold opacity-80">
                  2
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#171B26]">Two-Page Spread</div>
                  <div className="text-xs text-[#667085]">Authentic physical book format</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Paper Textures */}
          <div>
            <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2.5">
              Paper Texture & Tone
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {paperThemes.map((paper) => (
                <button
                  key={paper.id}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ paperTexture: paper.id });
                    soundEngine.playPagePeelSound();
                  }}
                  className={`relative p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    settings.paperTexture === paper.id
                      ? 'border-[#6677E8] ring-2 ring-[#6677E8]/20 shadow-xs'
                      : 'border-[#E5E7EB] hover:border-[#D5D9E2]'
                  }`}
                  style={{ backgroundColor: paper.bg, color: paper.text }}
                >
                  <div className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center">
                    {settings.paperTexture === paper.id && (
                      <Check className="w-3 h-3 text-[#6677E8] stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium leading-tight">{paper.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Typography Choice */}
          <div>
            <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2.5">
              Typography
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateSettings({ fontFamily: f.id as any })}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${f.fontClass} ${
                    settings.fontFamily === f.id
                      ? 'border-[#6677E8] bg-[#EEF0FF]/50 text-[#171B26] font-bold ring-2 ring-[#6677E8]/20'
                      : 'border-[#E5E7EB] bg-white hover:border-[#D5D9E2] text-[#171B26]'
                  }`}
                >
                  <div className="text-sm font-semibold">{f.label}</div>
                  <div className="text-[10px] text-[#667085] mt-0.5">Aa Bb Cc</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Ambient Atmosphere */}
          <div>
            <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2.5">
              Reading Atmosphere
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {atmospheres.map((atm) => (
                <button
                  key={atm.id}
                  type="button"
                  onClick={() => {
                    onUpdateAtmosphere(atm.id);
                    onUpdateSettings({ atmosphere: atm.id });
                  }}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    settings.atmosphere === atm.id
                      ? 'border-[#6677E8] bg-[#EEF0FF]/50 text-[#171B26] ring-2 ring-[#6677E8]/20'
                      : 'border-[#E5E7EB] bg-white hover:border-[#D5D9E2] text-[#171B26]'
                  }`}
                >
                  <div className="p-1.5 rounded-full bg-[#F7F8FA]">{atm.icon}</div>
                  <span className="text-xs font-semibold">{atm.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs sm:text-sm font-medium text-[#667085] hover:text-[#171B26] hover:bg-white rounded-full border border-[#E5E7EB] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="px-7 py-2.5 bg-[#6677E8] hover:bg-[#5263DB] active:bg-[#4352B8] text-white text-xs sm:text-sm font-semibold rounded-full shadow-md shadow-[#6677E8]/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Book & Start Reading</span>
          </button>
        </div>
      </div>
    </div>
  );
};
