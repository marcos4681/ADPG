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
