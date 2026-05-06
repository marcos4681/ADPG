/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Verse, WordDefinition } from '../types';
import { PROTESTANT_BOOKS } from '../constants';
import { translateChapterToModern } from './geminiService';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const API_BASE = 'https://bible-api.com';
const CACHE_PREFIX = 'bible_cache_';

export async function fetchWordDefinition(word: string, context?: string): Promise<WordDefinition | null> {
  const cacheKey = `bible_dict_${word}_${context || ''}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const prompt = `Atue como um dicionário bíblico teológico.
Defina a palavra "${word}" considerando o contexto bíblico: "${context || 'Contexto geral'}".
Retorne um objeto JSON com as seguintes chaves estritamente:
- "word": a palavra pesquisada (com a primeira letra maiúscula)
- "originalWord": a palavra original em hebraico ou grego (se aplicável, com transliteração e significado breve, ex: "Grego: agape - amor incondicional")
- "meaning": O significado teológico e histórico da palavra na Bíblia (seja claro e conciso)
- "context": Uma breve explicação do seu uso no contexto fornecido (ou uso geral na Bíblia)

Retorne apenas o JSON, sem markdown ou formatação adicional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text || "null";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const definition = JSON.parse(cleanedText);
    
    localStorage.setItem(cacheKey, JSON.stringify(definition));
    return definition;
  } catch (e) {
    console.error("Erro ao buscar definição da palavra:", e);
    return null;
  }
}

export async function fetchChapterTitle(bookName: string, chapter: number): Promise<string> {
  const cacheKey = `bible_title_${bookName}_${chapter}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Dê um título curto e temático (máximo 5 palavras) para o capítulo ${chapter} do livro de ${bookName} da Bíblia em Português. Retorne apenas o título, sem aspas.`,
    });

    const title = response.text || `${bookName} ${chapter}`;
    localStorage.setItem(cacheKey, title);
    return title;
  } catch (e) {
    console.error("Erro ao gerar título:", e);
    return `${bookName} ${chapter}`;
  }
}

export async function fetchCrossReferences(verse: Verse): Promise<{ reference: string; snippet: string }[]> {
  const cacheKey = `bible_cross_${verse.book_id}_${verse.chapter}_${verse.verse}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const prompt = `Encontre 3 a 5 referências cruzadas bíblicas relevantes para o versículo ${verse.book_name} ${verse.chapter}:${verse.verse} ("${verse.text}"). 
    Para cada referência, forneça o livro, capítulo e versículo (ex: João 3:16) e um pequeno trecho do texto.
    Retorne apenas um array JSON válido com o seguinte formato: [{"reference": "Nome Livro Cap:Ver", "snippet": "Trecho do texto"}].
    Responda apenas o JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text || "[]";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const refs = JSON.parse(cleanedText);
    
    localStorage.setItem(cacheKey, JSON.stringify(refs));
    return refs;
  } catch (e) {
    console.error("Erro ao buscar referências cruzadas:", e);
    return [];
  }
}

export async function fetchChapter(bookApiId: string, chapter: number, selectedTranslation?: string): Promise<Verse[]> {
  const bookInfo = PROTESTANT_BOOKS.find(b => b.api_id === bookApiId);
  const localizedQuery = bookInfo ? `${bookInfo.name} ${chapter}` : `${bookApiId} ${chapter}`;
  const defaultQuery = `${bookApiId} ${chapter}`;
  const cacheKey = `${CACHE_PREFIX}${bookApiId}_${chapter}_${selectedTranslation || 'default'}`;

  // Try to load from cache first if offline or as immediate return
  const cached = localStorage.getItem(cacheKey);
  
  // Lista de traduções permitidas
  const supportedTranslations = ['almeida']; 
  
  // Priorizar a tradução selecionada pelo usuário
  let orderedTranslations = supportedTranslations;
  
  // Special case: MNPG, blivre, adpg, or king_james seeks a literal base or generic text. We use 'almeida' for it until custom APIs are provided or AI translation is complete.
  const effectiveTranslation = (selectedTranslation === 'mnpg' || selectedTranslation === 'blivre' || selectedTranslation === 'adpg' || selectedTranslation === 'king_james') ? 'almeida' : selectedTranslation;

  if (effectiveTranslation && supportedTranslations.includes(effectiveTranslation)) {
    orderedTranslations = [effectiveTranslation];
  }
  
  if (!navigator.onLine && cached) {
    return JSON.parse(cached);
  }

  let finalVerses: Verse[] | null = null;

  for (const lang of orderedTranslations) {
    try {
      const url = `${API_BASE}/${encodeURIComponent(lang === 'almeida' ? localizedQuery : defaultQuery)}?translation=${lang}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.verses && data.verses.length > 0) {
          finalVerses = data.verses.map((v: any) => ({
            book_id: bookApiId,
            book_name: data.reference.split(' ')[0], 
            chapter: v.chapter,
            verse: v.verse,
            text: v.text
          }));
          break;
        }
      } 
    } catch (e) {
      // Fallback to cache if network fails for any reason
      if (cached) {
        return JSON.parse(cached);
      }
    }
  }

  // Tenta um último recurso sem tradução específica
  if (!finalVerses) {
    try {
      const fallbackUrl = `${API_BASE}/${encodeURIComponent(defaultQuery)}`;
      const fbResponse = await fetch(fallbackUrl);
      if (fbResponse.ok) {
        const fbData = await fbResponse.json();
        finalVerses = fbData.verses.map((v: any) => ({
          book_id: bookApiId,
          book_name: fbData.reference.split(' ')[0],
          chapter: v.chapter,
          verse: v.verse,
          text: v.text
        }));
      }
    } catch (e) {
      if (cached) return JSON.parse(cached);
    }
  }

  if (finalVerses) {
    if (selectedTranslation === 'adpg') {
      try {
        // Break into chunks of 30 verses to prevent LLM truncation
        const chunkSize = 30;
        const translatedSimplified = [];
        
        for (let i = 0; i < finalVerses.length; i += chunkSize) {
          const chunk = finalVerses.slice(i, i + chunkSize);
          const simplifiedVerses = chunk.map(v => ({ verse: v.verse, text: v.text }));
          const jsonText = JSON.stringify(simplifiedVerses);
          
          const modernJson = await translateChapterToModern(jsonText);
          let cleanedJson = modernJson.replace(/^```json/mi, '').replace(/```$/m, '').trim();
          
          // Fix potentially truncated JSON if array isn't closed
          if (cleanedJson && !cleanedJson.endsWith(']')) {
             if (cleanedJson.endsWith('}')) {
                 cleanedJson += ']';
             } else {
                 // Try to gracefully recover truncated JSON
                 const lastBrace = cleanedJson.lastIndexOf('}');
                 if (lastBrace > -1) {
                     cleanedJson = cleanedJson.substring(0, lastBrace + 1) + ']';
                 } else {
                     cleanedJson = '[]';
                 }
             }
          }
          
          const parsedChunk = JSON.parse(cleanedJson);
          translatedSimplified.push(...parsedChunk);
        }
        
        // Reconstruct the full verses array
        finalVerses = finalVerses.map(v => {
          const trans = translatedSimplified.find((t: any) => t.verse === v.verse);
          return trans ? { ...v, text: trans.text } : v;
        });
      } catch (e) {
        console.error('Erro na tradução com IA, usando Almeida como fallback', e);
      }
    }

    // Save to cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify(finalVerses));
      // Keep a registry of cached chapters
      const registry = JSON.parse(localStorage.getItem('bible_cache_registry') || '[]');
      if (!registry.includes(cacheKey)) {
        registry.push(cacheKey);
        // Limit registry/cache size if needed (e.g., last 50 chapters)
        if (registry.length > 50) {
          const oldKey = registry.shift();
          localStorage.removeItem(oldKey);
        }
        localStorage.setItem('bible_cache_registry', JSON.stringify(registry));
      }
    } catch (e) {
      console.warn("Storage full, could not cache chapter", e);
    }
    return finalVerses;
  }

  if (cached) return JSON.parse(cached);

  throw new Error('Este capítulo não está disponível offline. Por favor, conecte-se à internet para carregá-lo pela primeira vez.');
}

export async function searchBible(query: string): Promise<Verse[]> {
  try {
    // Attempting to use the search endpoint (undocumented in some places but often present in similar APIs)
    // bible-api.com doesn't have a broad search, but some forks or similar domains do.
    // However, if it fails, we will provide a clear message.
    const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&translation=almeida`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      if (data.results) {
        return data.results.map((v: any) => ({
          book_id: v.book_id,
          book_name: v.book_name,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text
        }));
      }
    }
    
    // If bible-api.com fails, we'll try another public one that is known for search:
    // https://www.abibliadigital.com.br/api/verses/search doesn't work without token.
    
    throw new Error('Endpoint de busca não disponível.');
  } catch (err) {
    console.error("Search error:", err);
    throw new Error('A busca global não está disponível no momento nesta versão gratuita da API.');
  }
}
