import React, { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      aria-label="Toggle dark mode"
      className={`rounded-md px-3 py-2 text-sm font-semibold border border-white/20 
                  bg-white/10 hover:bg-white/20 backdrop-blur
                  focus:outline-none focus:ring-2 focus:ring-[var(--ring)]
                  dark:text-white text-slate-900 dark:border-white/20 dark:bg-white/10 ${className}`}
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
