
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
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-panel bottom-nav-blur mx-auto max-w-md rounded-t-xl border-t">
        <div className="flex items-center justify-around p-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1 text-xs">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
