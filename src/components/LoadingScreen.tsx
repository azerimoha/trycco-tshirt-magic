
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  duration?: number;
  onFinished: () => void;
}

export function LoadingScreen({ duration = 2000, onFinished }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [showGlassmorphism, setShowGlassmorphism] = useState(false);
  
  useEffect(() => {
    // Update progress every 20ms
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        clearInterval(timer);
        // Show glassmorphism effect before finishing
        setShowGlassmorphism(true);
        setTimeout(() => {
          onFinished();
        }, 500); // 500ms for glassmorphism transition
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [duration, onFinished]);
  
  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-all duration-500 ${showGlassmorphism ? 'backdrop-blur-lg bg-opacity-0' : 'bg-opacity-100'}`}>
      <div className="relative w-full h-full flex items-center justify-center">
        <img 
          src="/lovable-uploads/b7a295aa-fefe-4313-964e-2ed62fcd1952.png" 
          alt="TRYCO T-shirts" 
          className="max-w-full max-h-full object-contain p-4"
        />
      </div>
      <div className="absolute bottom-10 w-full max-w-md px-4">
        <Progress value={progress} className="h-1" />
      </div>
    </div>
  );
}
