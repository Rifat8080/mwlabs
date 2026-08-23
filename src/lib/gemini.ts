import "server-only";

import { GoogleGenAI } from "@google/genai";

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}
