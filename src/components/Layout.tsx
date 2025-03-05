
import { BottomNav } from "./BottomNav";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center">
            <img
              src="/lovable-uploads/b542941f-e1de-4789-ae6d-0648738ca37d.png"
              alt="TRYCO"
              className="h-8 w-auto object-contain"
            />
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/profile")}
              className="rounded-full"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}
