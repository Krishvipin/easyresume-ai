export const getDynamicSuggestionsFromOpenRouter = async (resume: string, jobDescription: string, signal?: AbortSignal) => {
  // Support both process.env and import.meta.env for compatibility
  const apiKey = 
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) || 
    (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) || 
    "";
  
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  const prompt = `
You are an advanced ATS (Applicant Tracking System) resume evaluator and senior technical recruiter.

Your task is to deeply analyze the candidate resume against the provided job description.

Analyze the resume for:
- ATS keyword matching
- Missing important skills
- Resume clarity
- Impact of achievements
- Formatting readability
- Relevance to the job description
- Technical skill alignment
- Experience alignment
- Portfolio/project relevance
- Action verbs and measurable impact

Instructions:
- Give ONLY practical and specific suggestions.
- Avoid generic advice like "improve resume" or "add more details".
- Suggestions must be short, actionable, and directly tied to the job description.
- Focus on improving ATS score and recruiter appeal.
- Detect missing keywords from the job description.
- Suggest quantified achievements if missing.
- Mention important technologies/tools missing from the resume.
- Identify weak bullet points that lack measurable outcomes.
- Recommend stronger action verbs when needed.
- Evaluate portfolio/project relevance if applicable.

Resume:
${resume}

Job Description:
${jobDescription}

Return the response in EXACT JSON format:

{
  "score": 0,
  "summary": "string",
  "strengths": [
    "string"
  ],
  "suggestions": [
    "string"
  ],
  "missingKeywords": [
    "string"
  ],
  "improvements": [
    "string"
  ]
}

Rules:
- score must be between 0-100
- suggestions max 5 items
- missingKeywords max 15 items
- improvements must be highly specific
- return valid JSON only
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      "X-Title": "EasyResume AI",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [
        { role: "user", content: prompt }
      ]
    }),
    signal
  });

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
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse AI response from OpenRouter");
};
