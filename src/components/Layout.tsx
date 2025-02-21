
import { BottomNav } from "./BottomNav";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Link to="/" className="inline-block">
            <img
              src="/lovable-uploads/b542941f-e1de-4789-ae6d-0648738ca37d.png"
              alt="TRYCO"
              className="h-8"
            />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
