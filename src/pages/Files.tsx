
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FileIcon, FileText, FileType, Image, Plus, Upload } from "lucide-react";
import { useState } from "react";

type FileType = {
  id: string;
  name: string;
  type: "pdf" | "image" | "document" | "slides" | "other";
  size: string;
  dateAdded: Date;
  starred?: boolean;
  category?: string;
};

const FilesPage = () => {
  const [files, setFiles] = useState<FileType[]>([
    {
      id: "1",
      name: "Anotações de matemática.pdf",
      type: "pdf",
      size: "2.4 MB",
      dateAdded: new Date(new Date().setDate(new Date().getDate() - 2)),
      starred: true,
      category: "Matemática"
    },
    {
      id: "2",
      name: "Slides de história.pdf",
      type: "slides",
      size: "5.1 MB",
      dateAdded: new Date(new Date().setDate(new Date().getDate() - 5)),
      category: "História"
    },
    {
      id: "3",
      name: "Diagrama de biologia.jpg",
      type: "image",
      size: "1.8 MB",
      dateAdded: new Date(new Date().setDate(new Date().getDate() - 1)),
      category: "Biologia"
    }
  ]);

  const [activeTab, setActiveTab] = useState("todos");
  const [newFile, setNewFile] = useState<Partial<FileType>>({
    name: "",
    type: "document",
    category: "",
  });

  const fileTypeIcons = {
    pdf: <FileText className="h-8 w-8 text-red-400" />,
    image: <Image className="h-8 w-8 text-blue-400" />,
    document: <FileIcon className="h-8 w-8 text-green-400" />,
    slides: <FileType className="h-8 w-8 text-yellow-400" />,
    other: <FileIcon className="h-8 w-8 text-gray-400" />
  };

  const categories = [...new Set(files.map(file => file.category))].filter(Boolean) as string[];

  const handleAddFile = () => {
    if (newFile.name) {
      const file: FileType = {
        id: Math.random().toString(36).substring(2, 9),
        name: newFile.name,
        type: newFile.type as "pdf" | "image" | "document" | "slides" | "other",
        size: "0 KB",
        dateAdded: new Date(),
        category: newFile.category
      };

      setFiles([...files, file]);
      setNewFile({
        name: "",
        type: "document",
        category: "",
      });
      
      return true;
    }
    return false;
  };

  const toggleStar = (id: string) => {
    setFiles(files.map(file => 
      file.id === id ? { ...file, starred: !file.starred } : file
    ));
  };

  const filteredFiles = () => {
    if (activeTab === "todos") return files;
    if (activeTab === "favoritos") return files.filter(file => file.starred);
    return files.filter(file => file.category === activeTab);
  };

  return (
    <div className="container min-h-[calc(100vh-4rem)] py-8 md:py-12">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meus Arquivos</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Arquivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Arquivo</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes e faça upload do seu arquivo.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="fileName">Nome do Arquivo</Label>
                  <Input
                    id="fileName"
                    value={newFile.name}
                    onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fileType">Tipo</Label>
                  <Select 
                    defaultValue={newFile.type} 
                    onValueChange={(value) => setNewFile({ ...newFile, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                      <SelectItem value="slides">Slides</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={newFile.category}
                    placeholder="Ex: Matemática, História, etc."
                    onChange={(e) => setNewFile({ ...newFile, category: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fileUpload">Arquivo</Label>
                  <div className="flex items-center justify-center border-2 border-dashed border-border rounded-md p-6">
                    <div className="flex flex-col items-center space-y-2 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">Clique para fazer upload</span> ou arraste e solte
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, PPT, JPG, PNG (máx. 10MB)
                      </p>
                    </div>
                    <input
                      id="fileUpload"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => {
                  const success = handleAddFile();
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

        <Tabs defaultValue="todos" onValueChange={setActiveTab}>
          <TabsList className="grid w-full lg:w-[600px] grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
            {categories.slice(0, 4).map((category) => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {activeTab === "todos" 
                    ? "Todos os Arquivos" 
                    : activeTab === "favoritos" 
                      ? "Arquivos Favoritos" 
                      : `Arquivos de ${activeTab}`}
                </CardTitle>
                <CardDescription>
                  {filteredFiles().length} arquivos {activeTab !== "todos" && activeTab !== "favoritos" && `na categoria ${activeTab}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {filteredFiles().length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center">
                      <p className="text-muted-foreground">Nenhum arquivo encontrado.</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="mt-2">
                            Adicionar arquivo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Novo Arquivo</DialogTitle>
                            <DialogDescription>
                              Preencha os detalhes e faça upload do seu arquivo.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="fileName">Nome do Arquivo</Label>
                              <Input
                                id="fileName"
                                value={newFile.name}
                                onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="fileType">Tipo</Label>
                              <Select 
                                defaultValue={newFile.type} 
                                onValueChange={(value) => setNewFile({ ...newFile, type: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="image">Imagem</SelectItem>
                                  <SelectItem value="document">Documento</SelectItem>
                                  <SelectItem value="slides">Slides</SelectItem>
                                  <SelectItem value="other">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="category">Categoria</Label>
                              <Input
                                id="category"
                                value={newFile.category}
                                placeholder="Ex: Matemática, História, etc."
                                onChange={(e) => setNewFile({ ...newFile, category: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="fileUpload">Arquivo</Label>
                              <div className="flex items-center justify-center border-2 border-dashed border-border rounded-md p-6">
                                <div className="flex flex-col items-center space-y-2 text-center">
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                  <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-primary">Clique para fazer upload</span> ou arraste e solte
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    PDF, DOC, PPT, JPG, PNG (máx. 10MB)
                                  </p>
                                </div>
                                <input
                                  id="fileUpload"
                                  type="file"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" onClick={() => {
                              const success = handleAddFile();
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredFiles().map((file) => (
                        <Card key={file.id} className="hover-scale overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-center mb-2">
                              {fileTypeIcons[file.type]}
                            </div>
                            <CardTitle className="text-base truncate">{file.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {file.size} • {new Date(file.dateAdded).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-between pt-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleStar(file.id)}>
                              {file.starred ? 
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-5 h-5 text-yellow-400"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                : 
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.181.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.18-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                  />
                                </svg>
                              }
                            </Button>
                            <Button variant="ghost" size="sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                />
                              </svg>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FilesPage;
