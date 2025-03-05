
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        className: "sm:mb-4 md:mb-0", // Add margin on mobile to keep above bottom nav
        style: {
          marginBottom: "calc(var(--bottom-nav-height, 4rem) + 1rem)",
        }
      }}
    />
  );
}
