import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            T-Shirt Designer
          </Link>
          <nav className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip delayDuration={700}>
                <TooltipTrigger asChild>
                  <Link to="/customizer">
                    <Button variant="ghost">Customize</Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Design your own T-shirt</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip delayDuration={700}>
                <TooltipTrigger asChild>
                  <Link to="/profile">
                    <Button variant="ghost">Profile</Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View your profile and orders</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip delayDuration={700}>
                <TooltipTrigger asChild>
                  <Link to="/cart">
                    <Button variant="ghost" size="icon">
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View your shopping cart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DarkModeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} T-Shirt Designer. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
