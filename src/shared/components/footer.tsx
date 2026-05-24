import React from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { SOCIAL_LINKS } from "../constants/navigation";

const ICON_MAP: Record<string, any> = {
  Github: Github,
  Linkedin: Linkedin,
  Mail: Mail,
  Twitter: Twitter,
};

export const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-[#DADAEE] print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Branding & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center py-8 gap-8">
          {/* Left: Branding & Credit */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <img 
              src="/assets/logos/EasyResume AI.svg" 
              alt="EasyResume AI" 
              className="h-5 w-auto"
            />
            <p className="text-base text-[#7A7A8C] font-normal leading-[26px]">
              Built with <span className="text-[#27AE60]">💚</span> by Prashanth_ks
            </p>
          </div>

          {/* Right: Social Follow */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <span className="text-base text-[#7A7A8C] font-normal leading-[150%]">
              Follow me at
            </span>
            <div className="flex items-center gap-6">
              {SOCIAL_LINKS.map((link) => {
                const Icon = ICON_MAP[link.icon];
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4A4A57] hover:text-black transition-colors"
                    aria-label={link.label}
                  >
                    {Icon && <Icon className="h-6 w-6" />}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="border-t border-[#F1F1F1] py-4 text-center">
          <p className="text-base text-[#7A7A8C] font-normal leading-[26px]">
            © 2026 EasyResume AI | All rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};
