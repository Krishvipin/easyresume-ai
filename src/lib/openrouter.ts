import { generateATSPrompt } from "./ats-prompt";
import type { ATSAnalysisResult } from "../types/ats";

const logDev = (...args: any[]) => {
  console.log("[EasyResume AI]", ...args);
};

export const getDynamicSuggestionsFromOpenRouter = async (
  resume: string,
  jobDescription: string,
  parentSignal?: AbortSignal,
): Promise<ATSAnalysisResult | { error: true; message: string }> => {
  // Support both process.env and import.meta.env for compatibility
  const apiKey =
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
    (typeof process !== "undefined" && process.env?.VITE_OPENROUTER_API_KEY) ||
    (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) ||
    "";

  if (!apiKey) {
    logDev("[OpenRouter] API key is not configured.");
    throw new Error("OpenRouter API key is not configured");
  }

  const prompt = generateATSPrompt(resume, jobDescription);

  const modelsToTry = [
    "nvidia/nemotron-3.5-lightning:free",
    "thinkingmachines/inkling-small:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openrouter/free",
  ];

  let lastError: any = null;
  logDev("[OpenRouter] Initiating ATS analysis flow across candidate models:", modelsToTry);

  for (const model of modelsToTry) {
    if (parentSignal?.aborted) {
      logDev("[OpenRouter] Analysis request aborted by parent signal.");
      throw new Error("Analysis request was aborted");
    }

    logDev(`[OpenRouter] Trying model '${model}'...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s limit per model attempt

    const handleParentAbort = () => controller.abort();
    if (parentSignal) {
      parentSignal.addEventListener("abort", handleParentAbort);
    }

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
            messages: [{ role: "user", content: prompt }],
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorBody = await response.json();
          errorMsg = JSON.stringify(errorBody.error || errorBody);
        } catch (e) {
          // Ignore if not JSON
        }
        logDev(`[OpenRouter] Model '${model}' HTTP Error (${response.status}):`, errorMsg);
        throw new Error(`OpenRouter API error (${response.status}) for ${model}: ${errorMsg}`);
      }

      const data = await response.json();
      logDev(`[OpenRouter] Model '${model}' raw API response data:`, data);
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        logDev(`[OpenRouter] Model '${model}' returned empty content.`);
        throw new Error(`Empty response content from OpenRouter model ${model}`);
      }

      // Clean markdown fences if present
      const cleanText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && typeof parsed === "object") {
          logDev(`[OpenRouter] Model '${model}' successfully produced ATS result:`, parsed);
          return parsed as ATSAnalysisResult;
        }
      }
      logDev(`[OpenRouter] Model '${model}' returned non-JSON text output:`, text);
      throw new Error(`Failed to parse valid JSON from OpenRouter model ${model}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (parentSignal?.aborted) {
        throw err;
      }

      logDev(`[OpenRouter] Model '${model}' failed or timed out:`, err?.message || err);
      lastError = err;
    }
  }

  logDev("[OpenRouter] All model attempts failed. Last error:", lastError);
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

export const modifyResumeWithOpenRouter = async (
  formData: any,
  jobDescription: string,
  atsReport?: string,
  parentSignal?: AbortSignal,
): Promise<{
  summary?: string;
  experiences?: any[];
  skills?: string[];
  tools?: string[];
}> => {
  const apiKey =
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
    (typeof process !== "undefined" && process.env?.VITE_OPENROUTER_API_KEY) ||
    (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) ||
    "";

  if (!apiKey) {
    logDev("[OpenRouter] API key is not configured for resume modification.");
    throw new Error("OpenRouter API key is not configured");
  }

  // Import dynamic generator lazily or use generateTailorResumePrompt
  const { generateTailorResumePrompt } = await import("./tailor-prompt");
  const prompt = generateTailorResumePrompt(formData, jobDescription, atsReport);

  const modelsToTry = [
    "nvidia/nemotron-3.5-lightning:free",
    "thinkingmachines/inkling-small:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openrouter/free",
  ];

  let lastError: any = null;
  logDev("[OpenRouter] Initiating Tailor Resume flow across models:", modelsToTry);

  for (const model of modelsToTry) {
    if (parentSignal?.aborted) {
      throw new Error("Tailor resume request was aborted");
    }

    logDev(`[OpenRouter] Trying model '${model}' for resume tailoring...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s per attempt

    const handleParentAbort = () => controller.abort();
    if (parentSignal) {
      parentSignal.addEventListener("abort", handleParentAbort);
    }

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
            messages: [{ role: "user", content: prompt }],
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorBody = await response.json();
          errorMsg = JSON.stringify(errorBody.error || errorBody);
        } catch (e) {}
        throw new Error(`OpenRouter API error (${response.status}) for ${model}: ${errorMsg}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error(`Empty response content from model ${model}`);
      }

      const cleanText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && typeof parsed === "object") {
          logDev(`[OpenRouter] Successfully tailored resume with model '${model}':`, parsed);
          return parsed;
        }
      }
      throw new Error(`Failed to parse JSON result from model ${model}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (parentSignal?.aborted) {
        throw err;
      }

      logDev(`[OpenRouter] Model '${model}' failed during resume tailoring:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All OpenRouter fallback models failed to tailor resume");
};
