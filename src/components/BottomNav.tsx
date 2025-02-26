
import { Link, useLocation } from "react-router-dom";
import { Home, Palette, ShoppingCart, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/customizer", icon: Palette, label: "Customize" },
  { path: "/store", icon: ShoppingCart, label: "Store" },
  { path: "/featured", icon: Star, label: "Featured" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <nav className="glass-nav mx-auto max-w-md rounded-xl">
        <div className="flex items-center justify-evenly px-2 py-3">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center justify-center w-16 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1 text-[0.65rem] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
