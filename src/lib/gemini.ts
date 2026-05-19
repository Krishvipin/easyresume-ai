import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function analyzeATS(resume: string, jobDescription: string) {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const prompt = `
    You are an expert ATS (Applicant Tracking System) analyzer. 
    Analyze the following resume against the job description and provide:
    1. A compatibility score (0-100).
    2. Key suggestions to improve the resume for this specific job.
    3. Specific improvements (keywords to add, experience to highlight).

    Resume:
    ${resume}

    Job Description:
    ${jobDescription}

    Return the result in JSON format:
    {
      "score": number,
      "suggestions": string[],
      "improvements": string[]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    // Extract JSON from the response (in case it's wrapped in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Error analyzing ATS with Gemini:", error);
    throw error;
  }
}
