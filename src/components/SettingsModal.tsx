import React from 'react';
import { ReaderSettings, PaperTexture, FontFamily, ReadingMode, Atmosphere } from '../types';
import {
  Sliders,
  X,
  BookOpen,
  Volume2,
  VolumeX,
  Type,
  AlignLeft,
  AlignJustify,
  Flame,
  CloudRain,
  Coffee,
  Building2,
  Sparkles,
  Sun,
  Lamp,
  CloudLightning,
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const paperTextures: { id: PaperTexture; label: string; bg: string; text: string }[] = [
    { id: 'cream', label: 'Classic Cream', bg: '#fdfbf7', text: '#2c2523' },
    { id: 'parchment', label: 'Parchment', bg: '#f4ecd8', text: '#2b2118' },
    { id: 'washi', label: 'Washi Mulberry', bg: '#faf7ee', text: '#24201c' },
    { id: 'linen', label: 'Heavy Linen', bg: '#f4efe6', text: '#221f1b' },
    { id: 'sepia', label: 'Warm Sepia', bg: '#f6eedb', text: '#3b2c1a' },
    { id: 'dark', label: 'Midnight Dark', bg: '#1a1918', text: '#e6e2dd' },
    { id: 'slate', label: 'Slate Night', bg: '#0f172a', text: '#e2e8f0' },
    { id: 'emerald', label: 'Emerald Vintage', bg: '#0d231e', text: '#e0ece7' },
  ];

  const atmospheres: { id: Atmosphere; label: string; icon: React.ReactNode }[] = [
    { id: 'studio', label: 'Studio Light', icon: <Sun className="w-4 h-4 text-[#6677E8]" /> },
    { id: 'candlelight', label: 'Candlelight', icon: <Flame className="w-4 h-4 text-orange-500" /> },
    { id: 'daylight', label: 'Daylight Study', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: 'desklamp', label: 'Desk Lamp', icon: <Lamp className="w-4 h-4 text-amber-500" /> },
    { id: 'rainy', label: 'Rainy Window', icon: <CloudLightning className="w-4 h-4 text-sky-400" /> },
  ];

  const fonts: { id: FontFamily; label: string; sample: string }[] = [
    { id: 'merriweather', label: 'Merriweather Serif', sample: 'The quick brown fox' },
    { id: 'eb-garamond', label: 'EB Garamond Classic', sample: 'The quick brown fox' },
    { id: 'playfair', label: 'Playfair Display', sample: 'The quick brown fox' },
    { id: 'cinzel', label: 'Cinzel Decorative', sample: 'THE QUICK BROWN FOX' },
    { id: 'sans', label: 'Modern Sans', sample: 'The quick brown fox' },
    { id: 'mono', label: 'Typewriter Mono', sample: 'The quick brown fox' },
  ];

  const ambientSounds: {
    id: ReaderSettings['ambientSound'];
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'none', label: 'Mute', icon: <VolumeX className="w-4 h-4" /> },
    { id: 'fireplace', label: 'Hearth Fire', icon: <Flame className="w-4 h-4 text-orange-400" /> },
    { id: 'rain', label: 'Gentle Rain', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
    { id: 'library', label: 'Quiet Library', icon: <Building2 className="w-4 h-4 text-[#6677E8]" /> },
    { id: 'cafe', label: 'Coffee Shop', icon: <Coffee className="w-4 h-4 text-emerald-400" /> },
  ];

  const handleAmbientChange = (type: ReaderSettings['ambientSound']) => {
    onUpdateSettings({ ambientSound: type });
    soundEngine.setAmbientSound(type, settings.ambientVolume);
  };

  const handleVolumeChange = (vol: number) => {
    onUpdateSettings({ ambientVolume: vol });
    soundEngine.setAmbientVolume(vol);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white border border-[#E6E9EF] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[88vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E9EF] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] text-[#6677E8] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#151923]">Reading Experience & Styling</h2>
              <p className="text-xs text-[#667085] font-sans">
                Customize paper textures, lighting, sounds, and typography
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white font-sans">
          {/* Section 1: Page Layout & View Mode */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Layout & Book Format
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onUpdateSettings({ readingMode: 'single' });
                  soundEngine.playPagePeelSound();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 cursor-pointer ${
                  settings.readingMode === 'single'
                    ? 'border-[#6677E8] bg-[#EEF0FF] text-[#151923] ring-1 ring-[#6677E8]'
                    : 'border-[#E6E9EF] hover:border-[#D5D9E2] text-[#20242D]'
                }`}
              >
                <div className="w-6 h-8 rounded border-2 border-current flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#151923]">Single Page</div>
                  <div className="text-[10px] text-[#667085]">Vertical focus</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onUpdateSettings({ readingMode: 'spread' });
                  soundEngine.playPagePeelSound();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 cursor-pointer ${
                  settings.readingMode === 'spread'
                    ? 'border-[#6677E8] bg-[#EEF0FF] text-[#151923] ring-1 ring-[#6677E8]'
                    : 'border-[#E6E9EF] hover:border-[#D5D9E2] text-[#20242D]'
                }`}
              >
                <div className="w-8 h-8 rounded border-2 border-current flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#151923]">Two-Page Spread</div>
                  <div className="text-[10px] text-[#667085]">Open physical book</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Paper Stock & Background Tone */}
          <div className="space-y-3 pt-2 border-t border-[#E6E9EF]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Paper Stock & Color Tone
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {paperTextures.map((texture) => (
                <button
                  key={texture.id}
                  onClick={() => {
                    onUpdateSettings({ paperTexture: texture.id });
                    soundEngine.playPagePeelSound();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.paperTexture === texture.id
                      ? 'border-[#6677E8] ring-2 ring-[#6677E8]/20 shadow-xs'
                      : 'border-[#E6E9EF] hover:border-[#D5D9E2]'
                  }`}
                  style={{ backgroundColor: texture.bg, color: texture.text }}
                >
                  <div className="text-xs font-semibold">{texture.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">Sample page</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Reading Atmosphere & Lighting */}
          <div className="space-y-3 pt-2 border-t border-[#E6E9EF]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Lighting & Room Atmosphere
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {atmospheres.map((atm) => (
                <button
                  key={atm.id}
                  onClick={() => onUpdateSettings({ atmosphere: atm.id })}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    settings.atmosphere === atm.id
                      ? 'border-[#6677E8] bg-[#EEF0FF] text-[#151923] ring-1 ring-[#6677E8]'
                      : 'border-[#E6E9EF] hover:border-[#D5D9E2] text-[#20242D]'
                  }`}
                >
                  {atm.icon}
                  <span className="text-xs font-semibold">{atm.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Typography, Font Size, Line Spacing */}
          <div className="space-y-3 pt-2 border-t border-[#E6E9EF]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Typography & Spacing
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ fontFamily: f.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.fontFamily === f.id
                      ? 'border-[#6677E8] bg-[#EEF0FF] text-[#151923] ring-1 ring-[#6677E8]'
                      : 'border-[#E6E9EF] hover:border-[#D5D9E2] text-[#20242D]'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{f.label}</div>
                  <div className="text-[10px] text-[#667085] truncate">{f.sample}</div>
                </button>
              ))}
            </div>

            {/* Font Size and Line Height sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs text-[#667085] mb-1">
                  <span>Font Size</span>
                  <span className="font-bold text-[#151923]">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="13"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-[#6677E8] h-1.5 bg-[#F3F5F8] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#667085] mb-1">
                  <span>Line Spacing</span>
                  <span className="font-bold text-[#151923]">{settings.lineHeight.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.3"
                  max="2.2"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) })}
                  className="w-full accent-[#6677E8] h-1.5 bg-[#F3F5F8] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Ambient Soundscapes */}
          <div className="space-y-3 pt-2 border-t border-[#E6E9EF]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Ambient Audio Background
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ambientSounds.map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => handleAmbientChange(snd.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                    settings.ambientSound === snd.id
                      ? 'border-[#6677E8] bg-[#EEF0FF] text-[#151923] ring-1 ring-[#6677E8]'
                      : 'border-[#E6E9EF] hover:border-[#D5D9E2] text-[#20242D]'
                  }`}
                >
                  {snd.icon}
                  <span className="text-[11px] font-semibold">{snd.label}</span>
                </button>
              ))}
            </div>

            {settings.ambientSound !== 'none' && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-[#667085] mb-1">
                  <span>Ambient Volume</span>
                  <span className="font-bold text-[#151923]">
                    {Math.round(settings.ambientVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full accent-[#6677E8] h-1.5 bg-[#F3F5F8] rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#E6E9EF] bg-[#F8FAFC]">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#6677E8] hover:bg-[#5263DB] text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
