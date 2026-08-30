/**
 * Central Site Configuration for EasyResume AI (Vite + React)
 */

const DEFAULT_SITE_URL = "https://easyresume-ai.vercel.app";

const getResolvedSiteUrl = (): string => {
  const envUrl = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();
  const rawUrl = envUrl && envUrl.length > 0 ? envUrl : DEFAULT_SITE_URL;
  return rawUrl.replace(/\/+$/, "");
};

export const SITE = {
  name: "EasyResume AI",
  shortName: "EasyResume",
  description:
    "Create professional resumes, check ATS compatibility, and generate tailored cover letters with AI.",

  url: getResolvedSiteUrl(),

  locale: "en_US",

  founder: {
    name: "Prashanth K.S.",
    twitterHandle: "@uxui_shan",
    twitter: "https://x.com/uxui_shan",
    linkedin: "https://www.linkedin.com/in/iamprashanthks/",
    github: "https://github.com/iamprashanthks",
  },

  ogImage: {
    width: 1200,
    height: 630,
  },

  themeColor: "#2F9E62",
  brandColor: "#27AE60",
} as const;

export const getCanonicalUrl = (path: string = "/"): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return cleanPath === "/" ? `${SITE.url}/` : `${SITE.url}${cleanPath}`;
};

export const getAbsoluteAssetUrl = (assetPath: string): string => {
  const cleanPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${SITE.url}${cleanPath}`;
};
