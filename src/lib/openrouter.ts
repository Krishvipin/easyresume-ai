export const getDynamicSuggestionsFromOpenRouter = async (
  resume: string,
  jobDescription: string,
  signal?: AbortSignal,
) => {
  // Support both process.env and import.meta.env for compatibility
  const apiKey =
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
    (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) ||
    "";

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  const prompt = `
You are a senior technical recruiter and ATS specialist who has screened thousands of resumes.
You have been handed a specific job description and a candidate's resume. Your job is to give
a brutally honest, deeply personalized evaluation — not a generic checklist.

---

## STEP 1 — Decode the Job Description First

Before touching the resume, extract from the JD:
- The 3–5 most critical skills or competencies this role demands (non-negotiable)
- The seniority signals (years of experience, ownership expectations, leadership cues)
- The domain context (industry, tech stack, team size, product type if inferrable)
- Any repeated or emphasized terms — these are high-weight ATS keywords
- The "hidden asks": soft signals buried in the JD (e.g., "fast-paced" = startup tolerance,
  "cross-functional" = stakeholder communication, "own the roadmap" = IC leadership)

## STEP 2 — Score the Resume Against THIS Specific JD

Do NOT apply a generic rubric. Score based on how well this resume answers the specific demands
you decoded in Step 1.

Scoring weights (apply proportionally to the JD's emphasis):
- Critical skill coverage: 35%
- Relevant experience depth and seniority match: 25%
- ATS keyword density (exact + semantic matches): 20%
- Quantified impact on JD-relevant work: 12%
- Presentation clarity and scannability: 8%

Be strict. A score of 80+ means a recruiter would shortlist this candidate with confidence.
50–79 means potential but with clear gaps. Below 50 means significant misalignment.

## STEP 3 — Build the Output

For each field, think: "Would this insight surprise the candidate, or is it something they
already know?" Aim for the former. Be specific to the JD — never write something that could
apply to any resume or any job.

**summary**: Write 2–3 sentences. Open with the candidate's biggest strength relative to
THIS role, then their most critical gap. Be direct. No filler phrases like "overall a strong
candidate."

**strengths**: What this resume does well specifically for this JD. Reference actual content
from the resume and map it to what the JD asked for.
- Bad: "Has strong communication skills"
- Good: "3 years at [Company] leading cross-functional sprints directly maps to the JD's
  requirement for owning sprint ceremonies as a solo PM"

**suggestions**: The top gaps between this resume and this JD. Each suggestion must:
- Name the specific JD requirement that's unmet
- Point to the resume section where it's weak or absent
- Give a concrete rewrite direction (not just "add more detail")
- Bad: "Quantify your achievements"
- Good: "The JD asks for 'driving 20%+ efficiency gains' — your Acme Corp bullet says
  'improved pipeline' with no number. Rewrite to: 'Reduced lead qualification time by 34%
  by rebuilding the CRM workflow, cutting sales cycle from 18 to 12 days'"

**missingKeywords**: Only list keywords that actually appear or are strongly implied in the JD
and are absent from the resume. Do not pad this list with generic tech terms.
Group them by type: [Required Skills], [Domain Terms], [Soft/Contextual Signals].

**improvements**: Specific rewrites or additions. Each item should be a concrete action:
- Prioritize changes that would most impact the ATS score for THIS role
- Suggest exact bullet point rewrites where the resume is vague
- Recommend which resume section to restructure if the JD emphasis doesn't match section weight
- Flag if the resume summary/headline is misaligned with the target role title

---

Resume:
${resume}

Job Description:
${jobDescription}

---

Return ONLY this exact JSON. No preamble, no explanation, no markdown fences:

{
  "score": 0,
  "summary": "string",
  "strengths": ["string"],
  "suggestions": ["string"],
  "missingKeywords": ["string"],
  "improvements": ["string"]
}

Constraints:
- score: integer 0–100, calibrated strictly against this JD (not resume quality in isolation)
- strengths: 2–4 items, each explicitly tied to a JD requirement
- suggestions: 3–5 items, each naming the JD gap + resume location + rewrite direction
- missingKeywords: 5–15 items, only JD-grounded terms — no padding
- improvements: 3–6 items, each a concrete action with example wording where possible
- Every string must be specific to this resume and this JD — zero generic advice
`;

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

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse AI response from OpenRouter");
};
