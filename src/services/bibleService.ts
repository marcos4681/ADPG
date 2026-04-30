/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Verse } from '../types';

const API_BASE = 'https://bible-api.com';

export async function fetchChapter(bookApiId: string, chapter: number, selectedTranslation?: string): Promise<Verse[]> {
  // We ensure the query is clean and capitalized as per typical API expectations
  // bible-api.com generally works with "Book Name Chapter"
  const query = `${bookApiId} ${chapter}`;
  
  // Lista de traduções permitidas (somente Português)
  // almeida = Almeida Recebida
  // rccv = Almeida Revista e Corrigida
  const supportedTranslations = ['almeida', 'rccv']; 
  
  // Priorizar a tradução selecionada pelo usuário se ela for suportada
  let orderedTranslations = supportedTranslations;
  if (selectedTranslation && supportedTranslations.includes(selectedTranslation)) {
    const others = supportedTranslations.filter(t => t !== selectedTranslation);
    orderedTranslations = [selectedTranslation, ...others];
  }
  
  for (const lang of orderedTranslations) {
    try {
      const url = `${API_BASE}/${encodeURIComponent(query)}?translation=${lang}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.verses && data.verses.length > 0) {
          return data.verses.map((v: any) => ({
            book_id: bookApiId,
            book_name: data.reference.split(' ')[0], 
            chapter: v.chapter,
            verse: v.verse,
            text: v.text
          }));
        }
      } 
    } catch (e) {
      // Falha silenciosa para permitir o fallback sem poluir o console do usuário
      // console.debug(`Tradução ${lang} falhou, tentando próxima...`, e);
    }
  }

  // Tenta um último recurso sem tradução específica (pode retornar KJV se as outras falharem)
  try {
    const fallbackUrl = `${API_BASE}/${encodeURIComponent(query)}`;
    const fbResponse = await fetch(fallbackUrl);
    if (fbResponse.ok) {
      const fbData = await fbResponse.json();
      return fbData.verses.map((v: any) => ({
        book_id: bookApiId,
        book_name: fbData.reference.split(' ')[0],
        chapter: v.chapter,
        verse: v.verse,
        text: v.text
      }));
    }
  } catch (e) {
    console.error("Falha total no fallback:", e);
  }

  throw new Error('Este capítulo não está disponível no momento. Por favor, tente a tradução "Almeida Tradicional" nas configurações.');
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
