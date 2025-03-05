
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import { LoadingScreen } from "./components/LoadingScreen";
import Index from "./pages/Index";
import Customizer from "./pages/Customizer";
import Store from "./pages/Store";
import Featured from "./pages/Featured";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          {isLoading ? (
            <LoadingScreen onLoadingComplete={handleLoadingComplete} />
          ) : (
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/customizer" element={<Customizer />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/featured" element={<Featured />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
