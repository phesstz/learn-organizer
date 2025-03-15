
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, FileUp, Calculator, ClipboardCheck, ScanText, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      title: "Organize Tarefas",
      description: "Acompanhe todas as suas tarefas, trabalhos e estudos em um só lugar.",
      icon: <ListTodo className="h-8 w-8 text-primary" />,
      path: "/calendario"
    },
    {
      title: "Calendário de Provas",
      description: "Marque datas de provas, prazos e compromissos importantes.",
      icon: <CalendarCheck className="h-8 w-8 text-primary" />,
      path: "/calendario"
    },
    {
      title: "Armazene Materiais",
      description: "Guarde suas anotações, PDFs, slides e outros materiais de estudo.",
      icon: <FileUp className="h-8 w-8 text-primary" />,
      path: "/arquivos"
    },
    {
      title: "Notas de Provas",
      description: "Insira suas notas e calcule médias automaticamente.",
      icon: <Calculator className="h-8 w-8 text-primary" />,
      path: "/notas"
    },
    {
      title: "Checklist de Provas",
      description: "Crie listas de conteúdos para estudar antes de uma avaliação.",
      icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
      path: "/checklist"
    },
    {
      title: "Reconhecimento de Texto",
      description: "Escaneie textos de fotos e transforme-os em anotações digitais.",
      icon: <ScanText className="h-8 w-8 text-primary" />,
      path: "/ocr"
    }
  ];

  return (
    <div className="container min-h-[calc(100vh-4rem)] py-8 md:py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Organize seus <span className="text-primary animate-pulse-slow">estudos</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:w-3/4 mx-auto">
          Uma plataforma completa para organizar provas, atividades, lembretes e materiais de estudo em um único lugar.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="glass-card overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <div className="mb-2">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-muted-foreground">
                {feature.description}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Link to={feature.path} className="w-full">
                <Button variant="secondary" className="w-full">Acessar</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to="/calendario">
          <Button size="lg" className="animate-fade-in">
            Começar a organizar
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
