/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Book {
  id: string;
  name: string;
  api_id: string;
  chapters: number;
  testament: 'Antigo' | 'Novo';
}

export interface FavoriteVerse extends Verse {
  savedAt: number;
}

export interface Highlight {
  id?: string;
  book_id: string;
  chapter: number;
  verse: number;
  color: string;
  updatedAt: number;
}

export interface WordDefinition {
  word: string;
  originalWord?: string;
  meaning: string;
  context: string;
}

export interface Settings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  chatFontSize: 'small' | 'medium' | 'large';
  theme: 'dark' | 'light';
  translation: 'almeida' | 'rccv' | 'mnpg' | 'blivre' | 'adpg' | 'king_james';
  lineSpacing: 'tight' | 'relaxed' | 'loose';
  fontFamily?: 'sans' | 'serif' | 'mono';
  textColor?: 'default' | 'blue' | 'rose' | 'emerald' | 'amber' | 'purple';
}

