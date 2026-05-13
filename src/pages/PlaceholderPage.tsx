import React from "react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex-1 flex flex-col pt-20 pb-20 items-start">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-[24px] font-bold tracking-tight text-black font-display">{title}</h1>
          <p className="text-[16px] leading-[26px] text-[#4A4A57] font-normal max-w-[667px]">
            {description || "This feature is currently under development. Stay tuned for updates on our professional resume optimization toolset."}
          </p>
        </div>
      </div>
    </div>
  );
}
