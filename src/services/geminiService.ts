/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function explainVerse(verse: string, context?: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const prompt = `Você é um estudioso bíblico protestante. Explique o seguinte versículo de forma clara e teológica, fornecendo contexto histórico e aplicação prática:

Versículo: ${verse}
${context ? `Contexto Adicional: ${context}` : ''}

Responda em Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    throw error;
  }
}

export async function askBibleQuestion(question: string, currentPassage?: string) {
  const prompt = `Você é um assistente de estudos bíblicos digital. Ajude o usuário com sua dúvida bíblica.
${currentPassage ? `O usuário está lendo atualmente: ${currentPassage}` : ''}

Dúvida: ${question}

Responda de forma pastoral e baseada na Bíblia (Protestante, 66 livros).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    throw error;
  }
}

export async function translateChapterToModern(versesText: string): Promise<string> {
  const prompt = `Você é um tradutor bíblico protestante altamente capacitado, especialista na língua hebraica, grega e no português do Brasil atual.
Seu objetivo é transformar o seguinte texto bíblico em uma linguagem moderna, fluida e clara (Português do Brasil), comparável à 'Nova Versão Internacional' (NVI) ou 'Nova Tradução na Linguagem de Hoje' (NTLH), mas sem violar direitos autorais.
Você deve modernizar os termos mantendo estritamente o significado teológico original e a divisão exata dos versículos.

Instruções críticas:
- Preserve todas as tags de numeração de versículo originais ou numerações caso eu forneça no formato JSON ou lista.
Como eu vou enviar usando um JSON array de versículos, retorne EXATAMENTE o mesmo JSON array atualizado com os textos modernos.

Aqui estão os versículos em formato JSON:
${versesText}

Responda APENAS com o JSON modificado, sem blocos de código ou markdown extra.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use consistent flash model
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao chamar Gemini na tradução:", error);
    throw error;
  }
}

