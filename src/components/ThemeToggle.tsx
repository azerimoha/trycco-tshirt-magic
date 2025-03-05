
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative h-8 w-16 rounded-full p-1 transition-colors duration-200",
        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
      )}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200",
          theme === "dark" ? "translate-x-8" : "translate-x-0"
        )}
      >
        {theme === "dark" ? (
          <Moon className="h-4 w-4 text-slate-800" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </span>
    </button>
  );
}
