
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  duration?: number;
}

export function LoadingScreen({ onLoadingComplete, duration = 2000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    // Preload the background image
    const img = new Image();
    img.src = "/lovable-uploads/436f23f4-8e5a-48c8-a155-4dc85af6644a.png";
    img.onload = () => setImageLoaded(true);
    
    // Start the loading progress
    const startTime = Date.now();
    const interval = 10; // Update progress every 10ms for smooth animation
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (elapsed >= duration) {
        clearInterval(timer);
        onLoadingComplete();
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [duration, onLoadingComplete]);
  
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      style={{
        backgroundImage: `url('/lovable-uploads/436f23f4-8e5a-48c8-a155-4dc85af6644a.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: imageLoaded ? 1 : 0,
        transition: "opacity 0.3s ease-in-out"
      }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <img 
          src="/lovable-uploads/b542941f-e1de-4789-ae6d-0648738ca37d.png"
          alt="TRYCO" 
          className="h-auto w-auto max-w-[70%] max-h-[70%] object-contain"
        />
      </div>
      <div className="absolute bottom-4 w-full max-w-md px-4">
        <Progress value={progress} className="h-1" />
      </div>
    </div>
  );
}
