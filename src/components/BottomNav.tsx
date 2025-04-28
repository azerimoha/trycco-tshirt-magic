
import { Link, useLocation } from "react-router-dom";
import { Home, Palette, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/customizer", icon: Palette, label: "Customize" },
  { path: "/store", icon: ShoppingCart, label: "Store" },
  { path: "/featured", icon: Star, label: "Featured" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <nav className="glass-nav mx-auto max-w-md rounded-xl">
        <div className="flex items-center justify-center px-2 py-3">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "nav-item flex flex-col items-center justify-center px-4 transition-all",
                  isActive
                    ? "text-primary active"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn("nav-indicator", isActive && "active")}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-1 text-[0.65rem] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
