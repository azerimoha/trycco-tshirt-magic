import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  duration?: number;
}

export function LoadingScreen({ onLoadingComplete, duration = 5000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  // Preload the background image
  useEffect(() => {
    const bgImage = new Image();
    bgImage.src = "/lovable-uploads/d431afb3-c096-4f85-8d03-1ba1e75c3bc4.png";
    bgImage.onload = () => setBgLoaded(true);
  }, []);
  
  // Start the progress bar animation once the background is loaded
  useEffect(() => {
    if (!bgLoaded) return;
    
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
  }, [duration, onLoadingComplete, bgLoaded]);
  
  // Handle logo preloading
  const handleLogoLoad = () => {
    setLogoLoaded(true);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Background image with object-cover to maintain aspect ratio */}
      {bgLoaded && (
        <div className="absolute inset-0 z-0">
          <img 
            src="/lovable-uploads/d431afb3-c096-4f85-8d03-1ba1e75c3bc4.png"
            alt="Background" 
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      {/* Logo container - only shows when background is loaded */}
      {bgLoaded && (
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <img 
            src="/lovable-uploads/b542941f-e1de-4789-ae6d-0648738ca37d.png"
            alt="TRYCO" 
            className={`h-auto w-auto max-w-[70%] max-h-[70%] object-contain transition-opacity duration-500 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleLogoLoad}
          />
        </div>
      )}
      
      {/* Progress bar - only shows when background and logo are loaded */}
      {bgLoaded && logoLoaded && (
        <div className="absolute bottom-4 w-full max-w-md px-4 z-20">
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </div>
  );
}
