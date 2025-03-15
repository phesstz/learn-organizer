
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

interface Grade {
  id: string;
  subject: string;
  score: number;
  weight: number;
  date: string;
}

const Notas = () => {
  const [grades, setGrades] = useLocalStorage<Grade[]>("student-grades", []);
  const [open, setOpen] = useState(false);
  const [newGrade, setNewGrade] = useState<Omit<Grade, "id">>({
    subject: "",
    score: 0,
    weight: 1,
    date: new Date().toISOString().split("T")[0],
  });

  const handleAddGrade = () => {
    if (!newGrade.subject) {
      toast.error("Por favor, adicione um nome para a matéria.");
      return;
    }

    const gradeToAdd = {
      ...newGrade,
      id: Date.now().toString(),
    };

    setGrades([...grades, gradeToAdd]);
    setNewGrade({
      subject: "",
      score: 0,
      weight: 1,
      date: new Date().toISOString().split("T")[0],
    });
    setOpen(false);
    toast.success("Nota adicionada com sucesso!");
  };

  const handleDeleteGrade = (id: string) => {
    setGrades(grades.filter((grade) => grade.id !== id));
    toast.success("Nota removida com sucesso!");
  };

  const calculateAverage = (subject: string): number => {
    const subjectGrades = grades.filter((grade) => grade.subject === subject);
    if (subjectGrades.length === 0) return 0;

    const totalWeight = subjectGrades.reduce((acc, grade) => acc + grade.weight, 0);
    const weightedSum = subjectGrades.reduce((acc, grade) => acc + grade.score * grade.weight, 0);

    return totalWeight === 0 ? 0 : parseFloat((weightedSum / totalWeight).toFixed(2));
  };

  const getUniqueSubjects = (): string[] => {
    return [...new Set(grades.map((grade) => grade.subject))];
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Nota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Nota</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da nota que você recebeu
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Matéria
                </Label>
                <Input
                  id="subject"
                  placeholder="Matemática, Física, etc."
                  className="col-span-3"
                  value={newGrade.subject}
                  onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="score" className="text-right">
                  Nota
                </Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className="col-span-3"
                  value={newGrade.score}
                  onChange={(e) => setNewGrade({ ...newGrade, score: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weight" className="text-right">
                  Peso
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  className="col-span-3"
                  value={newGrade.weight}
                  onChange={(e) => setNewGrade({ ...newGrade, weight: parseFloat(e.target.value) || 1 })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  value={newGrade.date}
                  onChange={(e) => setNewGrade({ ...newGrade, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddGrade}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {getUniqueSubjects().length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">Você ainda não cadastrou nenhuma nota.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              Adicionar Nota
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getUniqueSubjects().map((subject) => (
            <Card key={subject}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{subject}</CardTitle>
                  <span className="text-2xl font-bold">
                    {calculateAverage(subject).toString()}
                  </span>
                </div>
                <CardDescription>
                  Média calculada com base em {grades.filter((g) => g.subject === subject).length} avaliações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {grades
                    .filter((grade) => grade.subject === subject)
                    .map((grade) => (
                      <div key={grade.id} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                          <span className="font-medium">{grade.score.toString()}</span>
                          <span className="text-muted-foreground text-xs ml-2">
                            Peso: {grade.weight} | {new Date(grade.date).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGrade(grade.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notas;
