import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-brand.light dark:bg-slate-950">
      <header className="bg-brand text-white dark:bg-slate-900">
        <div className="container-px flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="ENVET" className="h-10 w-10 object-contain" />
            <div>
              <p className="text-xs tracking-widest">NON PROFIT</p>
              <h1 className="text-lg font-semibold">Eagles Nest Veterans Equine Therapy</h1>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {[
              ["Home", "/"],
              ["About", "/about"],
              ["Services", "/services"],
              ["Gallery", "/gallery"],
              ["Donate", "/donate"],
              ["Legal", "/legal"],
              ["Tax", "/tax"],
            ].map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]
                   ${isActive ? "underline underline-offset-4" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="container-px py-8 grow text-slate-900 dark:text-slate-100">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300 dark:bg-black mt-12">
        <div className="container-px py-10">
          <p className="text-sm">
            © {new Date().getFullYear()} Eagles Nest Veterans Equine Therapy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
