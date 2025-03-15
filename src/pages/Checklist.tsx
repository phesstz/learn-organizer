
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ChecklistItem = {
  id: string;
  content: string;
  checked: boolean;
};

type Checklist = {
  id: string;
  title: string;
  date: string;
  items: ChecklistItem[];
};

const Checklist = () => {
  const { toast } = useToast();
  const [checklists, setChecklists] = useLocalStorage<Checklist[]>("exam-checklists", []);
  const [activeTab, setActiveTab] = useState("all");
  const [newChecklist, setNewChecklist] = useState<{ title: string; date: string }>({
    title: "",
    date: "",
  });
  const [newItem, setNewItem] = useState<{ checklistId: string; content: string }>({
    checklistId: "",
    content: "",
  });

  const addChecklist = () => {
    if (!newChecklist.title) {
      toast({
        title: "Erro",
        description: "O título da checklist é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const newList: Checklist = {
      id: Date.now().toString(),
      title: newChecklist.title,
      date: newChecklist.date,
      items: [],
    };

    setChecklists([...checklists, newList]);
    setNewChecklist({ title: "", date: "" });
    setNewItem({ ...newItem, checklistId: newList.id });
    
    toast({
      title: "Checklist criada",
      description: `Checklist "${newList.title}" criada com sucesso`,
    });
  };

  const addItem = (checklistId: string) => {
    if (!newItem.content) {
      toast({
        title: "Erro",
        description: "O conteúdo do item é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const newItemObj: ChecklistItem = {
      id: Date.now().toString(),
      content: newItem.content,
      checked: false,
    };

    const updatedChecklists = checklists.map(list => {
      if (list.id === checklistId) {
        return {
          ...list,
          items: [...list.items, newItemObj],
        };
      }
      return list;
    });

    setChecklists(updatedChecklists);
    setNewItem({ ...newItem, content: "" });
  };

  const toggleItemCheck = (checklistId: string, itemId: string) => {
    const updatedChecklists = checklists.map(list => {
      if (list.id === checklistId) {
        return {
          ...list,
          items: list.items.map(item => {
            if (item.id === itemId) {
              return { ...item, checked: !item.checked };
            }
            return item;
          }),
        };
      }
      return list;
    });

    setChecklists(updatedChecklists);
  };

  const removeItem = (checklistId: string, itemId: string) => {
    const updatedChecklists = checklists.map(list => {
      if (list.id === checklistId) {
        return {
          ...list,
          items: list.items.filter(item => item.id !== itemId),
        };
      }
      return list;
    });

    setChecklists(updatedChecklists);
    
    toast({
      title: "Item removido",
      variant: "destructive",
    });
  };

  const removeChecklist = (checklistId: string) => {
    const updatedChecklists = checklists.filter(list => list.id !== checklistId);
    setChecklists(updatedChecklists);
    
    toast({
      title: "Checklist removida",
      variant: "destructive",
    });
  };

  const getProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0;
    const checkedItems = items.filter(item => item.checked).length;
    return Math.round((checkedItems / items.length) * 100);
  };

  const filterChecklists = () => {
    if (activeTab === "all") return checklists;
    if (activeTab === "upcoming") {
      return checklists.filter(list => {
        if (!list.date) return false;
        const listDate = new Date(list.date);
        const today = new Date();
        return listDate >= today;
      });
    }
    if (activeTab === "completed") {
      return checklists.filter(list => 
        list.items.length > 0 && list.items.every(item => item.checked)
      );
    }
    return checklists;
  };

  const filteredChecklists = filterChecklists();

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Checklist de Provas</h1>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Checklist</CardTitle>
            <CardDescription>
              Crie uma lista de conteúdos para estudar antes da prova
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="checklist-title" className="text-sm font-medium">
                Título da Prova
              </label>
              <Input
                id="checklist-title"
                placeholder="Ex: Prova de Cálculo"
                value={newChecklist.title}
                onChange={(e) => setNewChecklist({...newChecklist, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="checklist-date" className="text-sm font-medium">
                Data da Prova
              </label>
              <Input
                id="checklist-date"
                type="date"
                value={newChecklist.date}
                onChange={(e) => setNewChecklist({...newChecklist, date: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={addChecklist} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Criar Checklist
            </Button>
          </CardFooter>
        </Card>

        <div>
          {filteredChecklists.length > 0 ? (
            filteredChecklists.map(checklist => (
              <Card key={checklist.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{checklist.title}</CardTitle>
                      {checklist.date && (
                        <CardDescription>
                          Data: {new Date(checklist.date).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeChecklist(checklist.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${getProgress(checklist.items)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {getProgress(checklist.items)}% concluído
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checklist.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`item-${item.id}`} 
                            checked={item.checked}
                            onCheckedChange={() => toggleItemCheck(checklist.id, item.id)}
                          />
                          <label 
                            htmlFor={`item-${item.id}`}
                            className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {item.content}
                          </label>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(checklist.id, item.id)}
                          className="h-6 w-6 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Input
                      placeholder="Adicionar conteúdo para estudar"
                      value={newItem.checklistId === checklist.id ? newItem.content : ""}
                      onChange={(e) => setNewItem({
                        checklistId: checklist.id,
                        content: e.target.value
                      })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addItem(checklist.id);
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      onClick={() => addItem(checklist.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  Nenhuma checklist encontrada. Crie sua primeira lista de estudos!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checklist;
