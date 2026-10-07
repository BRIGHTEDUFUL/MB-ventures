"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-11 h-11 rounded-lg bg-brand text-white shadow-lg hover:bg-brand-hover hover:shadow-xl active:bg-brand-active transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active-press animate-slide-up ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
