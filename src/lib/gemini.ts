import { GoogleGenAI } from "@google/genai";
import { generateATSPrompt } from "./ats-prompt";
import type { ATSAnalysisResult } from "../types/ats";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const logDev = (...args: any[]) => {
  if (import.meta.env?.DEV) {
    console.log(...args);
  }
};

export async function analyzeATS(resume: string, jobDescription: string): Promise<ATSAnalysisResult | { error: true; message: string }> {
  if (!apiKey) {
    logDev("[Gemini] API key is missing. Skipping Gemini analysis.");
    return { error: true, message: "Gemini API key is not configured" };
  }

  logDev("[Gemini] Initiating ATS analysis with gemini-1.5-flash...");
  const prompt = generateATSPrompt(resume, jobDescription);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
      logDev("[Gemini] Empty response received from Gemini.");
      throw new Error("Empty response from AI");
    }
    
    // Extract JSON from the response (in case it's wrapped in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      logDev("[Gemini] Successfully parsed ATS result from Gemini:", parsed);
      return parsed;
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    logDev("[Gemini] Error analyzing ATS with Gemini:", error);
    throw error;
  }
}

export async function generateCoverLetter(prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    return text.trim();
  } catch (error) {
    console.error("Error generating cover letter with Gemini:", error);
    throw error;
  }
}
