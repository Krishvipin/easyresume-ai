import { generateATSPrompt } from "./ats-prompt";
import type { ATSAnalysisResult } from "../types/ats";

export const getDynamicSuggestionsFromOpenRouter = async (
  resume: string,
  jobDescription: string,
  signal?: AbortSignal,
): Promise<ATSAnalysisResult | { error: true; message: string }> => {
  // Support both process.env and import.meta.env for compatibility
  const apiKey =
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
    (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) ||
    "";

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  const prompt = generateATSPrompt(resume, jobDescription);

  const modelsToTry = [
    "nvidia/nemotron-3.5-lightning:free",
    "thinkingmachines/inkling-small:free",
    "openrouter/free",
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000",
            "X-Title": "EasyResume AI",
          },
          body: JSON.stringify({
            model,
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }],
          }),
          signal,
        },
      );

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorBody = await response.json();
          errorMsg = JSON.stringify(errorBody.error || errorBody);
        } catch (e) {
          // Ignore if not JSON
        }
        throw new Error(`OpenRouter API error (${response.status}) for ${model}: ${errorMsg}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error(`Empty response content from OpenRouter model ${model}`);
      }

      // Extract JSON from the response (cleaning up markdown fences if present)
      const cleanText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && typeof parsed === "object") {
          return parsed as ATSAnalysisResult;
        }
      }
      throw new Error(`Failed to parse valid JSON from OpenRouter model ${model}`);
    } catch (err: any) {
      if (signal?.aborted || err.name === "AbortError") {
        throw err;
      }
      console.warn(`OpenRouter model '${model}' failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("All OpenRouter models failed to respond");
};

export const generateCoverLetterFromOpenRouter = async (
  prompt: string,
  signal?: AbortSignal,
): Promise<string> => {
  const apiKey =
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
    (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) ||
    "";

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000",
        "X-Title": "EasyResume AI",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    },
  );

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errorBody = await response.json();
      errorMsg = JSON.stringify(errorBody.error || errorBody);
    } catch (e) {
      // Ignore if not JSON
    }
    throw new Error(`OpenRouter API error (${response.status}): ${errorMsg}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  if (!text) {
    throw new Error("Empty response from OpenRouter");
  }

  return text.trim();
};
