
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const [theme, setTheme] = useLocalStorage<"dark" | "light">("ui-theme", "dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast.success(`Tema ${newTheme === "light" ? "claro" : "escuro"} ativado`);
  };

  useEffect(() => {
    // Apply theme to the document
    document.documentElement.classList.toggle("light-theme", theme === "light");
    document.documentElement.classList.toggle("dark-theme", theme === "dark");
    
    // Update CSS variables based on theme
    if (theme === "light") {
      document.documentElement.style.setProperty("--background", "0 0% 100%");
      document.documentElement.style.setProperty("--foreground", "240 10% 3.9%");
      document.documentElement.style.setProperty("--primary", "252 79% 65%");
    } else {
      document.documentElement.style.setProperty("--background", "240 10% 3.9%");
      document.documentElement.style.setProperty("--foreground", "0 0% 98%");
      document.documentElement.style.setProperty("--primary", "252 100% 70%");
    }
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label="Alternar tema"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
};

export default ThemeToggle;
