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
    { id: 'studio', label: 'Studio Light', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: 'candlelight', label: 'Candlelight', icon: <Flame className="w-4 h-4 text-orange-500" /> },
    { id: 'daylight', label: 'Daylight Study', icon: <Sun className="w-4 h-4 text-yellow-500" /> },
    { id: 'desklamp', label: 'Desk Lamp', icon: <Lamp className="w-4 h-4 text-amber-400" /> },
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
    { id: 'library', label: 'Quiet Library', icon: <Building2 className="w-4 h-4 text-amber-400" /> },
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
        className="relative w-full max-w-xl bg-[#FDFCF8] border border-[#DCD7C9] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[88vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD7C9] bg-[#F4F1EA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/30 flex items-center justify-center text-[#5A5A40]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1A1A]">Reading Experience & Styling</h2>
              <p className="text-xs text-[#8C8471] font-sans">Customize 3D display, paper, typography, and sound</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C8471] hover:text-[#1A1A1A] hover:bg-[#E8E4D8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCF8] font-sans">
          {/* Reading Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C8471] mb-2">
              Book Reading Layout
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateSettings({ readingMode: 'spread' })}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  settings.readingMode === 'spread'
                    ? 'bg-[#5A5A40]/10 border-[#5A5A40] text-[#1A1A1A]'
                    : 'bg-[#F4F1EA]/60 border-[#DCD7C9] text-[#5A5A40] hover:bg-[#F4F1EA]'
                }`}
              >
                <BookOpen className="w-5 h-5 text-[#5A5A40]" />
                <div className="text-left">
                  <div className="text-xs font-semibold">3D Double Page Spread</div>
                  <div className="text-[10px] opacity-70 text-[#8C8471]">Realistic open book with turning leaves</div>
                </div>
              </button>

              <button
                onClick={() => onUpdateSettings({ readingMode: 'single' })}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  settings.readingMode === 'single'
                    ? 'bg-[#5A5A40]/10 border-[#5A5A40] text-[#1A1A1A]'
                    : 'bg-[#F4F1EA]/60 border-[#DCD7C9] text-[#5A5A40] hover:bg-[#F4F1EA]'
                }`}
              >
                <Type className="w-5 h-5 text-[#5A5A40]" />
                <div className="text-left">
                  <div className="text-xs font-semibold">Single Sliding Page</div>
                  <div className="text-[10px] opacity-70 text-[#8C8471]">Compact tablet & mobile sliding view</div>
                </div>
              </button>
            </div>
          </div>

          {/* Paper Theme */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C8471] mb-2">
              Paper Texture & Stock
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {paperTextures.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onUpdateSettings({ paperTexture: p.id })}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    settings.paperTexture === p.id
                      ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30'
                      : 'border-[#DCD7C9] hover:border-[#8C8471]'
                  }`}
                  style={{ backgroundColor: p.bg, color: p.text }}
                >
                  <span className="text-xs font-serif font-bold">{p.label}</span>
                  <span className="text-[10px] opacity-60">Abc 123</span>
                </button>
              ))}
            </div>
          </div>

          {/* Atmospheric Room Lighting */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C8471] mb-2">
              Atmospheric Room Lighting
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {atmospheres.map((atm) => (
                <button
                  key={atm.id}
                  onClick={() => onUpdateSettings({ atmosphere: atm.id })}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                    (settings.atmosphere || 'studio') === atm.id
                      ? 'bg-[#5A5A40]/15 border-[#5A5A40] text-[#1A1A1A] ring-1 ring-[#5A5A40]'
                      : 'bg-[#F4F1EA]/60 border-[#DCD7C9] text-[#8C8471] hover:bg-[#F4F1EA]'
                  }`}
                >
                  {atm.icon}
                  <span className="text-[11px] font-medium mt-1">{atm.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography Font */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C8471] mb-2">
              Font Family
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ fontFamily: f.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    settings.fontFamily === f.id
                      ? 'bg-[#5A5A40]/10 border-[#5A5A40] text-[#1A1A1A]'
                      : 'bg-[#F4F1EA]/60 border-[#DCD7C9] text-[#2C2C2C] hover:bg-[#F4F1EA]'
                  }`}
                >
                  <div className="text-xs font-semibold">{f.label}</div>
                  <div className="text-[11px] opacity-60 truncate mt-0.5">{f.sample}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sizing & Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs text-[#8C8471] mb-1.5">
                <span className="font-semibold uppercase tracking-wider">Font Size</span>
                <span className="font-sans font-bold text-[#5A5A40]">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min="13"
                max="24"
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                className="w-full accent-[#5A5A40]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-[#8C8471] mb-1.5">
                <span className="font-semibold uppercase tracking-wider">Line Spacing</span>
                <span className="font-sans font-bold text-[#5A5A40]">{settings.lineHeight}x</span>
              </div>
              <input
                type="range"
                min="1.3"
                max="2.2"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) })}
                className="w-full accent-[#5A5A40]"
              />
            </div>
          </div>

          {/* Alignment & Drop Caps */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C8471] mb-1.5">
                Text Alignment
              </label>
              <div className="flex rounded-xl bg-[#F4F1EA] p-1 border border-[#DCD7C9]">
                <button
                  onClick={() => onUpdateSettings({ textAlign: 'justify' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    settings.textAlign === 'justify' ? 'bg-[#5A5A40] text-[#F4F1EA]' : 'text-[#8C8471]'
                  }`}
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                  Justified
                </button>
                <button
                  onClick={() => onUpdateSettings({ textAlign: 'left' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    settings.textAlign === 'left' ? 'bg-[#5A5A40] text-[#F4F1EA]' : 'text-[#8C8471]'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  Left Aligned
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C8471] mb-1.5">
                Drop Caps
              </label>
              <button
                onClick={() => onUpdateSettings({ dropCaps: !settings.dropCaps })}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  settings.dropCaps
                    ? 'bg-[#5A5A40]/10 border-[#5A5A40] text-[#1A1A1A]'
                    : 'bg-[#F4F1EA]/60 border-[#DCD7C9] text-[#8C8471]'
                }`}
              >
                <span>Illuminated Initial Letter</span>
                <span className="text-[10px] uppercase font-bold text-[#5A5A40]">
                  {settings.dropCaps ? 'Enabled' : 'Disabled'}
                </span>
              </button>
            </div>
          </div>

          {/* Soundscapes & Tactile Effects */}
          <div className="pt-3 border-t border-[#DCD7C9] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8C8471] flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                Paper Rustle Sound Effects
              </label>
              <button
                onClick={() => onUpdateSettings({ soundEffects: !settings.soundEffects })}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  settings.soundEffects
                    ? 'bg-[#5A5A40] text-[#F4F1EA]'
                    : 'bg-[#E8E4D8] text-[#8C8471]'
                }`}
              >
                {settings.soundEffects ? 'ON' : 'OFF'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C8471] mb-2">
                Ambient Reading Soundscape
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ambientSounds.map((snd) => (
                  <button
                    key={snd.id}
                    onClick={() => handleAmbientChange(snd.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                      settings.ambientSound === snd.id
                        ? 'bg-[#5A5A40]/15 border-[#5A5A40] text-[#1A1A1A]'
                        : 'bg-[#F4F1EA]/60 border-[#DCD7C9] text-[#8C8471] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    {snd.icon}
                    <span className="text-[10px] font-medium">{snd.label}</span>
                  </button>
                ))}
              </div>

              {settings.ambientSound !== 'none' && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[11px] text-[#8C8471] shrink-0 font-medium">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.ambientVolume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full accent-[#5A5A40]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Auto Flip Slideshow */}
          <div className="pt-3 border-t border-[#DCD7C9] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                Hands-Free Auto Flip
              </div>
              <div className="text-[11px] text-[#8C8471]">Automatically advances pages at regular timer intervals</div>
            </div>
            <div className="flex items-center gap-2">
              {settings.autoFlip && (
                <select
                  value={settings.autoFlipInterval}
                  onChange={(e) => onUpdateSettings({ autoFlipInterval: Number(e.target.value) })}
                  className="px-2 py-1 bg-[#FDFCF8] border border-[#DCD7C9] rounded-lg text-xs text-[#2C2C2C]"
                >
                  <option value={5}>5s</option>
                  <option value={8}>8s</option>
                  <option value={12}>12s</option>
                  <option value={20}>20s</option>
                </select>
              )}
              <button
                onClick={() => onUpdateSettings({ autoFlip: !settings.autoFlip })}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  settings.autoFlip ? 'bg-[#5A5A40] text-[#F4F1EA]' : 'bg-[#E8E4D8] text-[#8C8471]'
                }`}
              >
                {settings.autoFlip ? 'Active' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
