
import { Calendar, FileText, Home, Moon, Sun, ClipboardCheck, Calculator, ScanText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  const navItems = [
    { 
      title: "Início", 
      path: "/", 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      title: "Calendário", 
      path: "/calendario", 
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      title: "Arquivos", 
      path: "/arquivos", 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      title: "Notas", 
      path: "/notas", 
      icon: <Calculator className="h-5 w-5" /> 
    },
    { 
      title: "Checklist", 
      path: "/checklist", 
      icon: <ClipboardCheck className="h-5 w-5" /> 
    },
    { 
      title: "OCR", 
      path: "/ocr", 
      icon: <ScanText className="h-5 w-5" /> 
    },
  ];

  // Alternar tema
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // No mundo real, aqui atualizaríamos as variáveis CSS para alternar o tema
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background/80 backdrop-blur-lg md:top-0 md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-2">
        <div className="hidden items-center space-x-2 md:flex">
          <span className="text-xl font-bold text-primary">StudyOrg</span>
        </div>
        
        <div className="flex w-full items-center justify-around md:w-auto md:justify-end md:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 p-2 transition-colors hover:text-primary md:flex-row md:space-x-2 md:space-y-0",
                location.pathname === item.path 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className="text-xs md:text-sm">{item.title}</span>
            </Link>
          ))}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="ml-2"
          >
            {darkMode ? (
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
