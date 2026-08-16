import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { Book, Chapter, PageData } from '../types';

// Configure pdfjs worker to a reliable CDN fallback or local bundle
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch {
    // fallback
  }
}

export interface ParseOptions {
  title?: string;
  author?: string;
  wordsPerPage?: number; // default 260
  coverTheme?: Book['coverTheme'];
}

export async function parseDocumentFile(
  file: File,
  options: ParseOptions = {}
): Promise<Book> {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  let rawText = '';
  let detectedTitle = options.title || fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let detectedAuthor = options.author || 'Document Author';
  let fileType: Book['fileType'] = 'txt';

  if (extension === 'pdf') {
    fileType = 'pdf';
    rawText = await extractTextFromPdf(file);
  } else if (extension === 'docx' || extension === 'doc') {
    fileType = 'docx';
    rawText = await extractTextFromDocx(file);
  } else if (extension === 'md' || extension === 'markdown') {
    fileType = 'md';
    rawText = await file.text();
  } else {
    fileType = 'txt';
    rawText = await file.text();
  }

  return createBookFromText(rawText, {
    ...options,
    title: detectedTitle,
    author: detectedAuthor,
    fileType,
    originalFileName: fileName,
  });
}

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');

      if (pageText.trim()) {
        fullText += `\n\n--- Page ${i} ---\n\n` + pageText;
      }
    }

    return fullText.trim() || 'No readable text could be extracted from this PDF.';
  } catch (err) {
    console.error('PDF parsing error, falling back to text stream:', err);
    // Fallback: try raw text reading
    const text = await file.text();
    const clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ');
    if (clean.length > 50) return clean;
    throw new Error('Could not parse PDF. The file may be password protected or image-only.');
  }
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (err) {
    console.error('Docx parsing error:', err);
    throw new Error('Failed to read Word document (.docx). Please verify file is valid.');
  }
}

export function createBookFromText(
  rawText: string,
  config: {
    title?: string;
    author?: string;
    coverSubtitle?: string;
    fileType?: Book['fileType'];
    coverTheme?: Book['coverTheme'];
    originalFileName?: string;
    wordsPerPage?: number;
  } = {}
): Book {
  const title = config.title?.trim() || 'Untitled Book';
  const author = config.author?.trim() || 'Anonymous';
  const wordsPerPage = config.wordsPerPage || 260;
  const coverTheme = config.coverTheme || 'classic-leather';
  const fileType = config.fileType || 'txt';

  // Normalize text and split into logical sections or chapters
  const cleanedText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Extract raw chapters or sections
  const { chaptersRaw, totalWords } = splitIntoChapters(cleanedText, title);

  // Paginate each chapter nicely
  const contentPages: PageData[] = [];
  const chapters: Chapter[] = [];

  // Page 1 is always the Cover Page
  const coverPage: PageData = {
    id: 1,
    pageNumber: 1,
    isCover: true,
    content: title,
    paragraphs: [title, author],
    wordCount: 10,
  };

  // We will build TOC dynamically
  let currentPageIndex = 3; // Cover is 1, TOC is 2, first content page is 3

  chaptersRaw.forEach((ch, chIndex) => {
    const chapterStartPage = currentPageIndex;
    const chapterPages = paginateChapter(ch.content, wordsPerPage, ch.title, chIndex + 1, currentPageIndex);

    chapters.push({
      id: `ch-${chIndex + 1}`,
      title: ch.title,
      pageNumber: chapterStartPage,
      previewSnippet: ch.content.slice(0, 160).replace(/\s+/g, ' ') + '...',
    });

    contentPages.push(...chapterPages);
    currentPageIndex += chapterPages.length;
  });

  // Table of Contents Page (Page 2)
  const tocPage: PageData = {
    id: 2,
    pageNumber: 2,
    isTableOfContents: true,
    chapterTitle: 'Table of Contents',
    content: 'Table of Contents',
    paragraphs: chapters.map((c) => `${c.title} ...... Page ${c.pageNumber}`),
    wordCount: 30,
  };

  // Back cover page (Last Page)
  const backCoverPage: PageData = {
    id: currentPageIndex,
    pageNumber: currentPageIndex,
    isBackCover: true,
    content: 'Finis - End of Document',
    paragraphs: [
      `Completed reading "${title}"`,
      `Total Words: ${totalWords.toLocaleString()}`,
      `Total Pages: ${currentPageIndex}`,
      'DocuBook Digital Edition',
    ],
    wordCount: 20,
  };

  const allPages = [coverPage, tocPage, ...contentPages, backCoverPage];

  return {
    id: 'book-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title,
    author,
    coverSubtitle: config.coverSubtitle || `${Math.ceil(totalWords / 250)} min read • ${totalWords.toLocaleString()} words`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    coverTheme,
    originalFileName: config.originalFileName,
    fileType,
    pages: allPages,
    chapters,
    bookmarks: [],
    currentPage: 1,
    readingProgress: 0,
    totalWords,
    totalPages: allPages.length,
  };
}

function splitIntoChapters(
  fullText: string,
  defaultTitle: string
): { chaptersRaw: { title: string; content: string }[]; totalWords: number } {
  // Regex to detect chapter breaks
  // e.g. "Chapter 1", "CHAPTER II", "Section 1", "Prologue", "Epilogue", "# Title", "Act I", "--- Page 1 ---"
  const chapterRegex = /(?:^|\n)(?:(?:#{1,3}\s+(.+))|(?:(?:Chapter|CHAPTER|Section|SECTION|Book|BOOK|Act|ACT|Part|PART)\s+[0-9IVXLCDMivxlcdm]+(?::\s*|\s*[-–—]\s*|\s+)?([^\n]*))|(?:(Prologue|PROLOGUE|Epilogue|EPILOGUE|Introduction|INTRODUCTION|Preface|PREFACE|Conclusion|CONCLUSION|Executive Summary|EXECUTIVE SUMMARY))|(?:---\s*Page\s+\d+\s*---))(?:\n|$)/gi;

  const matches: { index: number; title: string; length: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = chapterRegex.exec(fullText)) !== null) {
    const rawTitle = match[1] || match[2] || match[3] || match[0].replace(/[-—\n]/g, '').trim();
    matches.push({
      index: match.index,
      title: rawTitle.trim() || `Chapter ${matches.length + 1}`,
      length: match[0].length,
    });
  }

  const words = fullText.split(/\s+/).filter(Boolean).length;

  if (matches.length === 0) {
    // If no explicit chapters detected, chunk into sensible sections by word blocks if very long
    if (words > 1200) {
      const paragraphs = fullText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
      const chunks: { title: string; content: string }[] = [];
      let currentChunkText = '';
      let currentChunkWords = 0;
      let partIndex = 1;

      for (const p of paragraphs) {
        const pWords = p.split(/\s+/).length;
        if (currentChunkWords + pWords > 900 && currentChunkText) {
          chunks.push({
            title: `Part ${partIndex}: Section ${partIndex}`,
            content: currentChunkText.trim(),
          });
          partIndex++;
          currentChunkText = p;
          currentChunkWords = pWords;
        } else {
          currentChunkText += '\n\n' + p;
          currentChunkWords += pWords;
        }
      }

      if (currentChunkText.trim()) {
        chunks.push({
          title: `Part ${partIndex}`,
          content: currentChunkText.trim(),
        });
      }

      return { chaptersRaw: chunks, totalWords: words };
    }

    return {
      chaptersRaw: [
        {
          title: defaultTitle,
          content: fullText,
        },
      ],
      totalWords: words,
    };
  }

  // Slice chapters based on match positions
  const chapters: { title: string; content: string }[] = [];

  // Preamble if any text before first chapter
  if (matches[0].index > 50) {
    const preambleText = fullText.slice(0, matches[0].index).trim();
    if (preambleText) {
      chapters.push({
        title: 'Opening / Preface',
        content: preambleText,
      });
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index + current.length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : fullText.length;
    const content = fullText.slice(startIndex, endIndex).trim();

    if (content.length > 0) {
      chapters.push({
        title: current.title,
        content,
      });
    }
  }

  return {
    chaptersRaw: chapters.length > 0 ? chapters : [{ title: defaultTitle, content: fullText }],
    totalWords: words,
  };
}

function paginateChapter(
  chapterContent: string,
  targetWordsPerPage: number,
  chapterTitle: string,
  chapterIndex: number,
  startPageNumber: number
): PageData[] {
  const rawParagraphs = chapterContent
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (rawParagraphs.length === 0) {
    return [
      {
        id: startPageNumber,
        pageNumber: startPageNumber,
        chapterTitle,
        chapterIndex,
        content: chapterContent,
        paragraphs: [chapterContent],
        wordCount: chapterContent.split(/\s+/).length,
      },
    ];
  }

  const pages: PageData[] = [];
  let currentPageParagraphs: string[] = [];
  let currentWordCount = 0;
  let pageNum = startPageNumber;

  for (let i = 0; i < rawParagraphs.length; i++) {
    const p = rawParagraphs[i];
    const pWords = p.split(/\s+/).filter(Boolean).length;

    // If paragraph is huge (e.g. over 350 words), break it by sentences
    if (pWords > targetWordsPerPage * 1.3) {
      const sentences = p.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [p];
      let subP = '';
      let subPWords = 0;

      for (const sent of sentences) {
        const sentWords = sent.split(/\s+/).filter(Boolean).length;
        if (currentWordCount + sentWords > targetWordsPerPage && currentPageParagraphs.length > 0) {
          if (subP.trim()) {
            currentPageParagraphs.push(subP.trim());
          }
          pages.push({
            id: pageNum,
            pageNumber: pageNum,
            chapterTitle,
            chapterIndex,
            content: currentPageParagraphs.join('\n\n'),
            paragraphs: [...currentPageParagraphs],
            wordCount: currentWordCount,
          });
          pageNum++;
          currentPageParagraphs = [];
          currentWordCount = 0;
          subP = sent;
          subPWords = sentWords;
        } else {
          subP += (subP ? ' ' : '') + sent;
          subPWords += sentWords;
          currentWordCount += sentWords;
        }
      }

      if (subP.trim()) {
        currentPageParagraphs.push(subP.trim());
      }
      continue;
    }

    if (currentWordCount + pWords > targetWordsPerPage && currentPageParagraphs.length > 0) {
      // Flush current page
      pages.push({
        id: pageNum,
        pageNumber: pageNum,
        chapterTitle,
        chapterIndex,
        content: currentPageParagraphs.join('\n\n'),
        paragraphs: [...currentPageParagraphs],
        wordCount: currentWordCount,
      });
      pageNum++;
      currentPageParagraphs = [p];
      currentWordCount = pWords;
    } else {
      currentPageParagraphs.push(p);
      currentWordCount += pWords;
    }
  }

  // Flush remaining paragraphs
  if (currentPageParagraphs.length > 0) {
    pages.push({
      id: pageNum,
      pageNumber: pageNum,
      chapterTitle,
      chapterIndex,
      content: currentPageParagraphs.join('\n\n'),
      paragraphs: [...currentPageParagraphs],
      wordCount: currentWordCount,
    });
  }

  return pages;
}
