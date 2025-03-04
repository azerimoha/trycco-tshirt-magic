
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

const DarkModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={700}>
        <TooltipTrigger asChild>
          <div className="relative flex items-center justify-between w-14 h-7 px-1 rounded-full bg-secondary transition-colors duration-300 cursor-pointer"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            <Sun 
              className={`absolute left-1.5 w-4 h-4 text-yellow-400 transition-opacity duration-300 ${
                isDark ? "opacity-0" : "opacity-100"
              }`} 
            />
            <Moon 
              className={`absolute right-1.5 w-4 h-4 text-blue-300 transition-opacity duration-300 ${
                isDark ? "opacity-100" : "opacity-0"
              }`} 
            />
            <div 
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                isDark ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Switch to {isDark ? "light" : "dark"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DarkModeToggle;
