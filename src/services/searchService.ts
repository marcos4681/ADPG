import Fuse from 'fuse.js';
import { Verse } from '../types';
import { PROTESTANT_BOOKS } from '../constants';

let bibleData: any = null;
let fuse: Fuse<any> | null = null;

const JSON_BIBLE_URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_acf.json';

interface CachedVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export async function searchBibleLocal(query: string): Promise<Verse[]> {
  if (!bibleData) {
    try {
      const response = await fetch(JSON_BIBLE_URL);
      if (!response.ok) throw new Error('Falha ao baixar dados da Bíblia');
      bibleData = await response.json();
      
      // Flatten the bible for Fuse.js
      const flattened: CachedVerse[] = [];
      bibleData.forEach((book: any) => {
        // Find matching book in our constants to get the Portuguese name
        const bookInfo = PROTESTANT_BOOKS.find(b => 
          b.id.toLowerCase() === book.abbrev.toLowerCase() || 
          b.api_id.toLowerCase() === book.abbrev.toLowerCase()
        );
        const bookName = bookInfo ? bookInfo.name : book.abbrev;
        const bookId = bookInfo ? bookInfo.api_id : book.abbrev;

        book.chapters.forEach((chapter: string[], chapterIdx: number) => {
          chapter.forEach((text, verseIdx) => {
            flattened.push({
              book_id: bookId,
              book_name: bookName,
              chapter: chapterIdx + 1,
              verse: verseIdx + 1,
              text: text
            });
          });
        });
      });

      fuse = new Fuse(flattened, {
        keys: ['text'],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 3
      });
    } catch (err) {
      console.error('Error initializing search:', err);
      throw new Error('Falha ao inicializar a busca local.');
    }
  }

  if (fuse) {
    const results = fuse.search(query);
    return results.slice(0, 50).map(r => r.item);
  }

  return [];
}
