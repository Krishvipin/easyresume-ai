import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "../constants/navigation";
import { cn } from "../../lib/utils";

export function BuyMeCoffee() {
  return (
    <section className="w-full">
      <div className="bg-white p-6 sm:p-10">
        <div className="flex justify-center mb-6">
          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm text-emerald-600 font-medium border border-emerald-100">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h14v7a4 4 0 0 1-4 4H8a6 6 0 0 1-6-6V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            Support Us
          </span>
        </div>

        <div className="text-center">
          <h2 className="font-serif italic text-3xl sm:text-4xl text-zinc-900 mb-3">
            This tool is free, forever.
          </h2>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
            If it saves you time, consider buying us a coffee. No account
            needed, no hidden fees.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="https://ko-fi.com/astroanimate"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-amber-400 px-7 py-3 text-sm font-bold text-zinc-900 hover:bg-amber-300 transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
          >
            ☕ Support EasyResume AI
          </a>
          <p className="text-xs text-zinc-400">
            Every coffee helps keep the servers running.
          </p>
        </div>
      </div>
    </section>
  );
}

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <nav className="sticky top-0 inset-x-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 print:hidden transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/assets/logos/EasyResume AI navbar.svg"
                alt="EasyResume AI"
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-center space-x-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-black",
                    location.pathname === link.href
                      ? "text-black"
                      : "text-gray-500",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setIsDonateOpen(true)}
                style={{
                  height: "43px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: "12px",
                  paddingRight: "24px",
                  paddingBottom: "12px",
                  paddingLeft: "24px",
                  borderRadius: "32px",
                  backgroundColor: "#27AE60",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                className="hover:opacity-90 active:scale-95 shadow-sm cursor-pointer"
              >
                Donate 🤍
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-500 hover:text-black p-2"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block text-base font-medium transition-colors hover:text-black",
                      location.pathname === link.href
                        ? "text-black"
                        : "text-gray-500",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsDonateOpen(true);
                  }}
                  className="w-full py-3 px-6 rounded-full bg-[#27AE60] text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm"
                >
                  Donate 🤍
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Donate Modal Overlay */}
      <AnimatePresence>
        {isDonateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDonateOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100"
            >
              <button
                onClick={() => setIsDonateOpen(false)}
                aria-label="Close"
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all z-30"
              >
                <X size={18} />
              </button>
              <BuyMeCoffee />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
