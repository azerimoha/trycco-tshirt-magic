
import React from "react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";

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
      className="relative rounded-full overflow-hidden"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div 
        className={`absolute inset-0 flex items-center transition-transform duration-300 ease-in-out ${
          theme === "dark" ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Sun className="h-5 w-5 absolute left-3 text-yellow-400" />
        <Moon className="h-5 w-5 absolute right-3 text-blue-400" />
      </div>
      <div 
        className={`relative z-10 h-5 w-5 rounded-full transition-all duration-300 ${
          theme === "dark" 
            ? "bg-black translate-x-0 transform scale-100" 
            : "bg-white translate-x-full transform scale-100"
        }`}
      />
    </Button>
  );
}
