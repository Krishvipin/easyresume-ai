/**
 * A robust keyword extraction utility for ATS scoring.
 * Normalizes text and handles common tech variations and phrases.
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'to', 'of', 'in', 'on',
  'for', 'with', 'as', 'by', 'at', 'from', 'into', 'up', 'down', 'over',
  'under', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'your',
  'yours', 'our', 'we', 'you', 'he', 'she', 'him', 'her',
  'his', 'hers', 'it', 'its', 'they', 'them', 'their', 'theirs',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could',
  'may', 'might', 'must', 'ought'
]);

const VARIATION_MAP: Record<string, string> = {
  'back end': 'backend',
  'backend': 'backend',
  'front end': 'frontend',
  'frontend': 'frontend',
  'full stack': 'fullstack',
  'fullstack': 'fullstack',
  'software engineer': 'softwareengineer',
  'software developer': 'softwareengineer',
  'web developer': 'webdeveloper',
  'mobile developer': 'mobiledeveloper',
  'data scientist': 'datascientist',
  'data engineer': 'dataengineer',
  'machine learning': 'machinelearning',
  'artificial intelligence': 'ai',
  'project manager': 'projectmanager',
  'product manager': 'productmanager',
  'ui/ux': 'uiux',
  'ui ux': 'uiux',
  'ux/ui': 'uiux',
  'ux ui': 'uiux'
};

export const extractKeywords = (text: string): string[] => {
  if (!text) return [];

  let processed = text.toLowerCase();

  // 1. Replace common multi-word variations with single-word normalized versions
  Object.entries(VARIATION_MAP).forEach(([phrase, normalized]) => {
    // Use regex to replace phrases, handling variations in spacing/hyphens
    const regex = new RegExp(phrase.replace(/\s+/g, '[\\s-]+'), 'g');
    processed = processed.replace(regex, normalized);
  });

  // 2. Extract words, including common tech special characters like +, #, .
  // We want to keep C++, C#, .NET, Node.js, etc.
  const words = processed.match(/[a-z0-9+#.]+/g) ?? [];

  // 3. Filter stopwords and short/meaningless strings
  // But keep important short ones like 'c', 'go', 'r' if they are common in tech
  const TECH_SHORT_WORDS = new Set(['c', 'go', 'r', 'ai', 'ml', 'ui', 'ux']);
  
  const filtered = words.filter(word => {
    // Remove if it's a stopword
    if (STOPWORDS.has(word)) return false;
    
    // Remove if it's too short, unless it's a known tech short word
    if (word.length < 2 && !TECH_SHORT_WORDS.has(word)) return false;
    
    // Remove if it's just a number or common punctuation that got through
    if (/^\d+$/.test(word)) return false;
    
    return true;
  });

  // 4. Return unique keywords
  return Array.from(new Set(filtered));
};

export const calculateATSScore = (resumeText: string, jobDescriptionText: string) => {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobDescriptionText);

  if (jobKeywords.length === 0) return { score: 0, missing: [] };

  const matchedKeywords = jobKeywords.filter(kw => resumeKeywords.includes(kw));
  const missingKeywords = jobKeywords.filter(kw => !resumeKeywords.includes(kw));

  const score = Math.round((matchedKeywords.length / jobKeywords.length) * 100);

  return {
    score,
    matched: matchedKeywords,
    missing: missingKeywords
  };
};
