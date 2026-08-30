import React, { useEffect } from "react";
import { SITE, getCanonicalUrl, getAbsoluteAssetUrl } from "../../config/site";

export interface SEOProps {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogAlt?: string;
  ogType?: "website" | "article";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterAlt?: string;
  robots?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const updateMetaTag = (
  attributeName: "name" | "property",
  attributeValue: string,
  content: string | undefined
) => {
  if (content === undefined) return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const updateCanonicalLink = (href: string) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const updateJsonLdScript = (
  jsonLdData: Record<string, any> | Array<Record<string, any>> | undefined
) => {
  const SCRIPT_ID = "easyresume-seo-jsonld";
  const existing = document.getElementById(SCRIPT_ID);

  if (!jsonLdData) {
    if (existing) {
      existing.remove();
    }
    return;
  }

  let script = existing as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  try {
    script.textContent = JSON.stringify(jsonLdData);
  } catch (err) {
    console.error("[SEO] Error serializing JSON-LD structured data:", err);
  }
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  ogImage = "/og/home.png",
  ogAlt = "EasyResume AI",
  ogType = "website",
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterAlt,
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  jsonLd,
}) => {
  const canonicalUrl = getCanonicalUrl(path);
  const fullOgImage = ogImage.startsWith("http") ? ogImage : getAbsoluteAssetUrl(ogImage);
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;

  const finalTwitterTitle = twitterTitle || finalOgTitle;
  const finalTwitterDescription = twitterDescription || finalOgDescription;
  const finalTwitterImage = twitterImage
    ? twitterImage.startsWith("http")
      ? twitterImage
      : getAbsoluteAssetUrl(twitterImage)
    : fullOgImage;
  const finalTwitterAlt = twitterAlt || ogAlt;

  useEffect(() => {
    // 1. Document Title
    document.title = title;

    // 2. Standard Meta
    updateMetaTag("name", "description", description);
    updateMetaTag("name", "robots", robots);
    updateMetaTag("name", "googlebot", robots);

    // 3. Canonical Link
    updateCanonicalLink(canonicalUrl);

    // 4. Open Graph Tags
    updateMetaTag("property", "og:type", ogType);
    updateMetaTag("property", "og:site_name", SITE.name);
    updateMetaTag("property", "og:title", finalOgTitle);
    updateMetaTag("property", "og:description", finalOgDescription);
    updateMetaTag("property", "og:url", canonicalUrl);
    updateMetaTag("property", "og:locale", SITE.locale);
    updateMetaTag("property", "og:image", fullOgImage);
    updateMetaTag("property", "og:image:width", String(SITE.ogImage.width));
    updateMetaTag("property", "og:image:height", String(SITE.ogImage.height));
    updateMetaTag("property", "og:image:alt", ogAlt);

    // 5. Twitter Tags
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", finalTwitterTitle);
    updateMetaTag("name", "twitter:description", finalTwitterDescription);
    updateMetaTag("name", "twitter:image", finalTwitterImage);
    updateMetaTag("name", "twitter:image:alt", finalTwitterAlt);
    updateMetaTag("name", "twitter:creator", SITE.founder.twitterHandle);

    // 6. JSON-LD structured data
    updateJsonLdScript(jsonLd);

    return () => {
      // Clean up script on unmount if needed
    };
  }, [
    title,
    description,
    canonicalUrl,
    finalOgTitle,
    finalOgDescription,
    fullOgImage,
    ogAlt,
    ogType,
    finalTwitterTitle,
    finalTwitterDescription,
    finalTwitterImage,
    finalTwitterAlt,
    robots,
    jsonLd,
  ]);

  return null;
};
