
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FileIcon, FileText, FileType, Folder, FolderOpen, Image, Plus, Search, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type FileItemType = {
  id: string;
  name: string;
  type: "pdf" | "image" | "document" | "slides" | "other";
  size: string;
  dateAdded: Date;
  starred?: boolean;
  category?: string;
  folderId?: string;
};

type FolderType = {
  id: string;
  name: string;
  dateAdded: Date;
  parentId?: string;
};

const FilesPage = () => {
  const [files, setFiles] = useLocalStorage<FileItemType[]>("study-files", [
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

  const [folders, setFolders] = useLocalStorage<FolderType[]>("study-folders", [
    { id: "f1", name: "Matemática", dateAdded: new Date() },
    { id: "f2", name: "História", dateAdded: new Date() },
    { id: "f3", name: "Biologia", dateAdded: new Date() }
  ]);

  const [activeTab, setActiveTab] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItemType | null>(null);
  
  const [newFile, setNewFile] = useState<Partial<FileItemType>>({
    name: "",
    type: "document",
    category: "",
  });

  const [newFolder, setNewFolder] = useState<Partial<FolderType>>({
    name: ""
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
      const file: FileItemType = {
        id: Math.random().toString(36).substring(2, 9),
        name: newFile.name,
        type: newFile.type as "pdf" | "image" | "document" | "slides" | "other",
        size: "0 KB",
        dateAdded: new Date(),
        category: newFile.category,
        folderId: currentFolder || undefined
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

  const handleAddFolder = () => {
    if (newFolder.name) {
      const folder: FolderType = {
        id: Math.random().toString(36).substring(2, 9),
        name: newFolder.name,
        dateAdded: new Date(),
        parentId: currentFolder || undefined
      };

      setFolders([...folders, folder]);
      setNewFolder({
        name: ""
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
    let result = files;
    
    // Filtrar por pasta atual
    if (currentFolder) {
      result = result.filter(file => file.folderId === currentFolder);
    } else {
      // Mostrar apenas arquivos sem pasta quando estamos na raiz
      result = result.filter(file => !file.folderId);
    }
    
    // Aplicar filtros adicionais
    if (activeTab === "favoritos") {
      result = result.filter(file => file.starred);
    } else if (activeTab !== "todos") {
      result = result.filter(file => file.category === activeTab);
    }
    
    // Aplicar pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        file => 
          file.name.toLowerCase().includes(query) || 
          (file.category && file.category.toLowerCase().includes(query))
      );
    }
    
    return result;
  };

  const filteredFolders = () => {
    let result = folders.filter(folder => folder.parentId === currentFolder);
    
    // Aplicar pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(folder => folder.name.toLowerCase().includes(query));
    }
    
    return result;
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId);
    // Resetar a pesquisa ao navegar entre pastas
    setSearchQuery("");
  };

  const getCurrentPath = () => {
    if (!currentFolder) return "Raiz";
    
    const getFolderName = (id: string): string => {
      const folder = folders.find(f => f.id === id);
      return folder ? folder.name : "";
    };
    
    const buildPath = (id: string): string => {
      const folder = folders.find(f => f.id === id);
      if (!folder) return "";
      
      if (folder.parentId) {
        return `${buildPath(folder.parentId)} > ${folder.name}`;
      }
      
      return folder.name;
    };
    
    return buildPath(currentFolder);
  };

  const handleFileSelect = (file: FileItemType) => {
    setSelectedFile(file);
  };

  return (
    <div className="container min-h-[calc(100vh-4rem)] py-8 md:py-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Meus Arquivos</h1>
            <p className="text-muted-foreground">
              Localização atual: {getCurrentPath()}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar arquivos..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
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
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Folder className="mr-2 h-4 w-4" />
                  Nova Pasta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Pasta</DialogTitle>
                  <DialogDescription>
                    Digite o nome da nova pasta.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="folderName">Nome da Pasta</Label>
                    <Input
                      id="folderName"
                      value={newFolder.name}
                      onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => {
                    const success = handleAddFolder();
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
                    Criar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                  {filteredFiles().length} arquivos e {filteredFolders().length} pastas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {/* Navegação de pastas */}
                  {currentFolder && (
                    <Button
                      variant="outline"
                      className="mb-4 w-full justify-start"
                      onClick={() => {
                        const currentFolderObj = folders.find(f => f.id === currentFolder);
                        navigateToFolder(currentFolderObj?.parentId || null);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                      </svg>
                      Voltar
                    </Button>
                  )}

                  {filteredFolders().length === 0 && filteredFiles().length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center">
                      <p className="text-muted-foreground">Nenhum arquivo ou pasta encontrado.</p>
                      <div className="flex gap-2 mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link">
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
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link">
                              Criar pasta
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Criar Nova Pasta</DialogTitle>
                              <DialogDescription>
                                Digite o nome da nova pasta.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="folderName">Nome da Pasta</Label>
                                <Input
                                  id="folderName"
                                  value={newFolder.name}
                                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={() => {
                                const success = handleAddFolder();
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
                                Criar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Pastas */}
                      {filteredFolders().length > 0 && (
                        <div>
                          <h3 className="font-medium mb-3">Pastas</h3>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredFolders().map((folder) => (
                              <Card 
                                key={folder.id} 
                                className="hover-scale overflow-hidden cursor-pointer"
                                onClick={() => navigateToFolder(folder.id)}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex items-center mb-2">
                                    <FolderOpen className="h-8 w-8 text-yellow-400 mr-2" />
                                    <CardTitle className="text-base truncate">{folder.name}</CardTitle>
                                  </div>
                                  <CardDescription className="text-xs">
                                    {new Date(folder.dateAdded).toLocaleDateString()}
                                  </CardDescription>
                                </CardHeader>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Arquivos */}
                      {filteredFiles().length > 0 && (
                        <div>
                          <h3 className="font-medium mb-3">Arquivos</h3>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredFiles().map((file) => (
                              <Card 
                                key={file.id} 
                                className="hover-scale overflow-hidden"
                                onClick={() => handleFileSelect(file)}
                              >
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
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleStar(file.id);
                                    }}
                                  >
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
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Visualizador de arquivos */}
      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedFile.name}</DialogTitle>
              <DialogDescription>
                {selectedFile.size} • {new Date(selectedFile.dateAdded).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center p-4 min-h-[300px]">
              {selectedFile.type === "pdf" ? (
                <div className="w-full h-[500px] bg-secondary rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Visualizador de PDF será carregado aqui</p>
                </div>
              ) : selectedFile.type === "image" ? (
                <div className="w-full flex items-center justify-center">
                  <div className="bg-secondary rounded-lg p-4 flex items-center justify-center">
                    <Image className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Visualização da imagem</p>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-secondary rounded-lg p-8 flex flex-col items-center justify-center">
                  {fileTypeIcons[selectedFile.type]}
                  <p className="mt-4 text-center text-muted-foreground">
                    Este tipo de arquivo não pode ser visualizado diretamente.
                    <br />
                    <Button variant="link" className="mt-2">Fazer download</Button>
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedFile(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FilesPage;
