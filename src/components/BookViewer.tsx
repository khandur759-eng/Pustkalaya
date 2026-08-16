import React from 'react';
import { Book, ReaderSettings } from '../types';
import { PhysicalPaperReader } from './PhysicalPaperReader';

interface BookViewerProps {
  book: Book;
  settings: ReaderSettings;
  onPageChange: (newPage: number) => void;
  onToggleBookmark: (pageNumber: number) => void;
  onAddHighlight?: (pageNumber: number, text: string, color: 'amber' | 'sage' | 'rose' | 'sky') => void;
  searchQuery?: string;
  onToggleHUD?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const BookViewer: React.FC<BookViewerProps> = ({
  book,
  settings,
  onPageChange,
  onToggleBookmark,
  onAddHighlight,
  searchQuery = '',
  onToggleHUD,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  return (
    <PhysicalPaperReader
      book={book}
      settings={settings}
      onPageChange={onPageChange}
      onToggleBookmark={onToggleBookmark}
      onAddHighlight={onAddHighlight}
      searchQuery={searchQuery}
      onToggleHUD={onToggleHUD}
      isFullscreen={isFullscreen}
      onToggleFullscreen={onToggleFullscreen}
    />
  );
};
