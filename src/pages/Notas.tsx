
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Esquema para validação de notas
const notaSchema = z.object({
  disciplina: z.string().min(1, { message: "Disciplina é obrigatória" }),
  nota: z.string().refine(
    (val) => {
      const num = parseFloat(val.replace(',', '.'));
      return !isNaN(num) && num >= 0 && num <= 10;
    },
    { message: "Nota deve ser um número entre 0 e 10" }
  ),
  peso: z.string().refine(
    (val) => {
      const num = parseFloat(val.replace(',', '.'));
      return !isNaN(num) && num > 0;
    },
    { message: "Peso deve ser um número maior que 0" }
  ),
});

type Nota = z.infer<typeof notaSchema> & { id: string };

const Notas = () => {
  const { toast } = useToast();
  const [notas, setNotas] = useLocalStorage<Nota[]>("notas", []);
  
  const form = useForm<z.infer<typeof notaSchema>>({
    resolver: zodResolver(notaSchema),
    defaultValues: {
      disciplina: "",
      nota: "",
      peso: "1",
    },
  });

  const onSubmit = (data: z.infer<typeof notaSchema>) => {
    const novaNota: Nota = {
      ...data,
      id: Date.now().toString(),
    };
    
    setNotas([...notas, novaNota]);
    form.reset();
    
    toast({
      title: "Nota adicionada",
      description: `${data.disciplina}: ${data.nota}`,
    });
  };

  const removerNota = (id: string) => {
    setNotas(notas.filter(nota => nota.id !== id));
    toast({
      title: "Nota removida",
      variant: "destructive",
    });
  };

  const calcularMedia = (disciplina: string) => {
    const notasDisciplina = notas.filter(n => n.disciplina === disciplina);
    
    if (notasDisciplina.length === 0) return 0;
    
    let somaPonderada = 0;
    let somaPesos = 0;
    
    notasDisciplina.forEach(nota => {
      const valorNota = parseFloat(nota.nota.replace(',', '.'));
      const valorPeso = parseFloat(nota.peso.replace(',', '.'));
      
      somaPonderada += valorNota * valorPeso;
      somaPesos += valorPeso;
    });
    
    return somaPesos === 0 ? 0 : (somaPonderada / somaPesos).toFixed(2);
  };

  // Agrupar notas por disciplina
  const disciplinas = [...new Set(notas.map(nota => nota.disciplina))];

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Notas de Provas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nota</CardTitle>
            <CardDescription>
              Registre suas notas e calcule médias automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="disciplina"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disciplina</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Matemática" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota (0-10)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 8.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="peso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">Adicionar Nota</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Médias por Disciplina</h2>
          
          {disciplinas.length > 0 ? (
            disciplinas.map(disciplina => {
              const media = calcularMedia(disciplina);
              return (
                <Card key={disciplina} className={`border-l-4 ${parseFloat(media) >= 6 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{disciplina}</CardTitle>
                      <span className="text-xl font-bold">{media}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {notas
                        .filter(nota => nota.disciplina === disciplina)
                        .map(nota => (
                          <div key={nota.id} className="flex justify-between items-center bg-muted/50 p-2 rounded">
                            <span>Nota: {nota.nota} (Peso: {nota.peso})</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removerNota(nota.id)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Calculator className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  Adicione notas para visualizar as médias por disciplina
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notas;
