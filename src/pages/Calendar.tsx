
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

type EventType = {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: "exam" | "assignment" | "reminder" | "study";
};

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventType[]>([
    {
      id: "1",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      title: "Prova de Matemática",
      description: "Capítulos 1-5 do livro texto, foco em álgebra linear",
      type: "exam"
    },
    {
      id: "2",
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      title: "Entregar trabalho de História",
      description: "Pesquisa sobre o período medieval, mínimo de 5 páginas",
      type: "assignment"
    }
  ]);

  const [newEvent, setNewEvent] = useState<Partial<EventType>>({
    date: new Date(),
    title: "",
    description: "",
    type: "reminder"
  });

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      const event: EventType = {
        id: Math.random().toString(36).substring(2, 9),
        date: newEvent.date,
        title: newEvent.title,
        description: newEvent.description || "",
        type: newEvent.type as "exam" | "assignment" | "reminder" | "study"
      };

      setEvents([...events, event]);
      setNewEvent({
        date: new Date(),
        title: "",
        description: "",
        type: "reminder"
      });
      
      return true;
    }
    return false;
  };

  const typeColors = {
    exam: "bg-red-500",
    assignment: "bg-blue-500",
    reminder: "bg-yellow-500",
    study: "bg-green-500"
  };

  const typeLabels = {
    exam: "Prova",
    assignment: "Trabalho",
    reminder: "Lembrete",
    study: "Estudo"
  };

  const dayHasEvent = (day: Date) => {
    return events.some(event => 
      day.getDate() === event.date.getDate() && 
      day.getMonth() === event.date.getMonth() && 
      day.getFullYear() === event.date.getFullYear()
    );
  };

  const eventsForSelectedDate = events.filter(event => 
    date.getDate() === event.date.getDate() && 
    date.getMonth() === event.date.getMonth() && 
    date.getFullYear() === event.date.getFullYear()
  );

  return (
    <div className="container min-h-[calc(100vh-4rem)] py-8 md:py-12">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="flex flex-col space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>Visualize e gerencie suas atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasEvent: (date) => dayHasEvent(date),
                }}
                modifiersClassNames={{
                  hasEvent: "font-bold text-primary relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                }}
              />
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Evento</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do evento para adicionar ao seu calendário.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !newEvent.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEvent.date ? format(newEvent.date, "PPP") : <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newEvent.date}
                        onSelect={(date) => date && setNewEvent({ ...newEvent, date })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    defaultValue={newEvent.type} 
                    onValueChange={(value) => setNewEvent({ ...newEvent, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Prova</SelectItem>
                      <SelectItem value="assignment">Trabalho</SelectItem>
                      <SelectItem value="reminder">Lembrete</SelectItem>
                      <SelectItem value="study">Estudo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => {
                  const success = handleAddEvent();
                  if (success) {
                    document.querySelectorAll('[data-state="open"]').forEach(
                      (element) => {
                        const dialogClose = element.querySelector('[data-radix-collection-item]');
                        if (dialogClose) {
                          (dialogClose as HTMLElement).click();
                        }
                      }
                    );
                  }
                }}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{format(date, "dd 'de' MMMM, yyyy")}</CardTitle>
              <CardDescription>
                {eventsForSelectedDate.length 
                  ? `${eventsForSelectedDate.length} eventos para este dia` 
                  : "Nenhum evento para este dia"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {eventsForSelectedDate.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center">
                    <p className="text-muted-foreground">Nenhuma atividade agendada para este dia.</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="mt-2">
                          Adicionar evento
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Novo Evento</DialogTitle>
                          <DialogDescription>
                            Preencha os detalhes do evento para adicionar ao seu calendário.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                              id="title"
                              value={newEvent.title}
                              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="date">Data</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal",
                                    !newEvent.date && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {newEvent.date ? format(newEvent.date, "PPP") : <span>Escolha uma data</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={newEvent.date}
                                  onSelect={(date) => date && setNewEvent({ ...newEvent, date })}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select 
                              defaultValue={newEvent.type} 
                              onValueChange={(value) => setNewEvent({ ...newEvent, type: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="exam">Prova</SelectItem>
                                <SelectItem value="assignment">Trabalho</SelectItem>
                                <SelectItem value="reminder">Lembrete</SelectItem>
                                <SelectItem value="study">Estudo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              value={newEvent.description}
                              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={() => {
                            const success = handleAddEvent();
                            if (success) {
                              document.querySelectorAll('[data-state="open"]').forEach(
                                (element) => {
                                  const dialogClose = element.querySelector('[data-radix-collection-item]');
                                  if (dialogClose) {
                                    (dialogClose as HTMLElement).click();
                                  }
                                }
                              );
                            }
                          }}>
                            Adicionar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventsForSelectedDate.map((event) => (
                      <Card key={event.id} className="relative overflow-hidden">
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", typeColors[event.type])} />
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <span className={cn("rounded-full px-2 py-1 text-xs", 
                              event.type === "exam" ? "bg-red-500/20 text-red-300" : 
                              event.type === "assignment" ? "bg-blue-500/20 text-blue-300" : 
                              event.type === "reminder" ? "bg-yellow-500/20 text-yellow-300" : 
                              "bg-green-500/20 text-green-300"
                            )}>
                              {typeLabels[event.type]}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{event.description || "Sem descrição"}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
