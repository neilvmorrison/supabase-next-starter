"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      const savedTheme = localStorage.getItem("theme");

      if (savedTheme === "dark" || savedTheme === "light") {
        document.documentElement.classList.toggle(
          "dark",
          savedTheme === "dark"
        );
      } else {
        document.documentElement.classList.toggle("dark", mediaQuery.matches);
      }
    };

    updateTheme();

    mediaQuery.addEventListener("change", updateTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, []);

  return <>{children}</>;
}
