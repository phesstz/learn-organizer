
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Index from "./pages/Index";
import CalendarPage from "./pages/Calendar";
import FilesPage from "./pages/Files";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import NotasPage from "./pages/Notas";
import ChecklistPage from "./pages/Checklist";
import OCRPage from "./pages/OCR";

const queryClient = new QueryClient();

const App = () => {
  const [theme] = useLocalStorage<"dark" | "light">("ui-theme", "dark");

  useEffect(() => {
    // Apply theme to the document
    document.documentElement.classList.toggle("light-theme", theme === "light");
    document.documentElement.classList.toggle("dark-theme", theme === "dark");
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="pt-0 pb-16 md:pt-16 md:pb-0">
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/calendario" element={<CalendarPage />} />
              <Route path="/arquivos" element={<FilesPage />} />
              <Route path="/notas" element={<NotasPage />} />
              <Route path="/checklist" element={<ChecklistPage />} />
              <Route path="/ocr" element={<OCRPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
