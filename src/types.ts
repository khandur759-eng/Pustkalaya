export interface PageData {
  id: number;
  pageNumber: number; // 1-indexed
  chapterTitle?: string;
  chapterIndex?: number;
  isCover?: boolean;
  isTableOfContents?: boolean;
  isBackCover?: boolean;
  content: string; // Plain text or formatted paragraph blocks
  paragraphs: string[];
  wordCount: number;
  illustration?: 'alchemist' | 'compass' | 'hourglass' | 'feather' | 'tree' | 'constellation' | 'rabbit' | 'tower';
  quote?: string;
  quoteAuthor?: string;
  footnote?: string;
}

export interface Chapter {
  id: string;
  title: string;
  pageNumber: number; // Page where chapter starts
  previewSnippet: string;
}

export interface Bookmark {
  id: string;
  pageNumber: number;
  note?: string;
  createdAt: number;
  previewText: string;
}

export interface Highlight {
  id: string;
  pageNumber: number;
  text: string;
  color: 'amber' | 'sage' | 'rose' | 'sky';
  note?: string;
  createdAt: number;
}

export type CoverTheme =
  | 'classic-leather'
  | 'navy-gold'
  | 'emerald-vintage'
  | 'burgundy-royal'
  | 'slate-minimal'
  | 'amber-antique'
  | 'parchment-gold';

export type BookCategory =
  | 'classics'
  | 'fiction'
  | 'philosophy'
  | 'custom'
  | 'self-help'
  | 'history'
  | 'business'
  | 'science'
  | 'lifestyle';

export interface Book {
  id: string;
  title: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  coverTheme: CoverTheme;
  coverSubtitle?: string;
  originalFileName?: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'sample' | 'pasted';
  pages: PageData[];
  chapters: Chapter[];
  bookmarks: Bookmark[];
  highlights?: Highlight[];
  currentPage: number;
  readingProgress: number; // 0 to 100%
  totalWords: number;
  totalPages: number;
  isFavorite?: boolean;
  category?: BookCategory;
}

export type PaperTexture = 'cream' | 'parchment' | 'washi' | 'linen' | 'dark' | 'slate' | 'sepia' | 'emerald';
export type BookTheme = 'classic' | 'modern' | 'night' | 'vintage';
export type FontFamily = 'merriweather' | 'eb-garamond' | 'garamond' | 'playfair' | 'cinzel' | 'sans' | 'mono';
export type ReadingMode = 'auto' | 'spread' | 'single';
export type Atmosphere = 'candlelight' | 'daylight' | 'desklamp' | 'rainy' | 'studio' | 'night' | 'rainstorm';
export type AtmosphereTheme = Atmosphere;
export type DeskSurface = 'dark-oak' | 'walnut' | 'light-pine' | 'slate' | 'leather';

export interface ReaderSettings {
  theme: BookTheme;
  paperTexture: PaperTexture;
  fontFamily: FontFamily;
  fontSize: number; // 14 to 26 px
  lineHeight: number; // 1.4 to 2.2
  marginSize: 'compact' | 'normal' | 'spacious';
  textAlign: 'justify' | 'left';
  dropCaps: boolean;
  readingMode: ReadingMode;
  atmosphere?: Atmosphere;
  deskSurface?: DeskSurface;
  soundEffects: boolean;
  ambientSound: 'none' | 'fireplace' | 'rain' | 'library' | 'cafe';
  ambientVolume: number;
  autoFlip: boolean;
  autoFlipInterval: number; // in seconds
  showPageNumbers: boolean;
  enableKeyboardShortcuts: boolean;
  brightness: number; // 50 to 100%
  reducedMotion: boolean;
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  rate: number;
  voice: SpeechSynthesisVoice | null;
  currentReadingText: string;
}
