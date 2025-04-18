
import React from "react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full p-0 overflow-hidden bg-gray-200 dark:bg-gray-800"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div 
        className={`
          absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-black 
          transition-all duration-300 ease-in-out 
          ${theme === "dark" ? "translate-x-8" : "translate-x-0"}
        `}
      >
        {theme === "dark" ? (
          <Moon className="w-4 h-4 m-1 text-blue-400" />
        ) : (
          <Sun className="w-4 h-4 m-1 text-yellow-500" />
        )}
      </div>
    </Button>
  );
}
