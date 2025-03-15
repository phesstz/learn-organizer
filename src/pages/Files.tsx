
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Search, FolderPlus, FileUp, FilePlus, Folder, File, Image, FileText, MoreVertical, Download, Copy, Trash2, FileImage, FilePdf } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Tipos
interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  folderId: string | null;
  content: string; // URL do arquivo ou conteúdo base64
  thumbnail?: string;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

const FilesPage = () => {
  const [files, setFiles] = useLocalStorage<FileItem[]>("user-files", []);
  const [folders, setFolders] = useLocalStorage<Folder[]>("user-folders", [
    { id: "root", name: "Raiz", parentId: null }
  ]);
  const [currentFolder, setCurrentFolder] = useState<string>("root");
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("todos");
  const [conversionOpen, setConversionOpen] = useState(false);
  const [conversionType, setConversionType] = useState<"image-to-pdf" | "slides-to-notes">("image-to-pdf");
  const [filesToConvert, setFilesToConvert] = useState<FileList | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertFileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = files.filter(file => {
    const matchesFolder = file.folderId === currentFolder;
    const matchesSearch = searchQuery 
      ? file.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesType = selectedTab === "todos" 
      ? true 
      : file.type.startsWith(selectedTab === "imagens" ? "image" : selectedTab === "documentos" ? "application/pdf" : "");
    
    return matchesFolder && matchesSearch && matchesType;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: FileItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          folderId: currentFolder,
          content: e.target?.result as string,
        };

        // Se for uma imagem, gerar miniatura
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Redimensionar para miniatura
            canvas.width = 100;
            canvas.height = 100 * (img.height / img.width);
            
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            newFile.thumbnail = canvas.toDataURL();
            
            setFiles(prev => [...prev, newFile]);
          };
          img.src = e.target?.result as string;
        } else {
          setFiles(prev => [...prev, newFile]);
        }
      };
      reader.readAsDataURL(file);
    });

    toast.success("Arquivos enviados com sucesso!");
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Nome da pasta não pode estar vazio");
      return;
    }

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      parentId: currentFolder
    };

    setFolders([...folders, newFolder]);
    setNewFolderName("");
    setNewFolderOpen(false);
    toast.success("Pasta criada com sucesso!");
  };

  const handleNavigateToFolder = (folderId: string) => {
    setCurrentFolder(folderId);
    setSelectedTab("todos");
  };

  const handleNavigateUp = () => {
    const currentFolderObj = folders.find(f => f.id === currentFolder);
    if (currentFolderObj && currentFolderObj.parentId) {
      setCurrentFolder(currentFolderObj.parentId);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
    toast.success("Arquivo excluído com sucesso!");
  };

  const handleDeleteFolder = (folderId: string) => {
    // Verificar se a pasta está vazia
    const hasFiles = files.some(file => file.folderId === folderId);
    const hasSubfolders = folders.some(folder => folder.parentId === folderId);

    if (hasFiles || hasSubfolders) {
      toast.error("Não é possível excluir uma pasta que contém arquivos ou subpastas");
      return;
    }

    setFolders(folders.filter(folder => folder.id !== folderId));
    toast.success("Pasta excluída com sucesso!");
  };

  const getCurrentFolderPath = () => {
    const path: Folder[] = [];
    let currentId = currentFolder;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId || "";
      } else {
        break;
      }
    }
    
    return path;
  };

  const handleDownloadFile = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleConvertFiles = async () => {
    if (!filesToConvert || filesToConvert.length === 0) {
      toast.error("Por favor, selecione arquivos para converter");
      return;
    }

    if (conversionType === "image-to-pdf") {
      toast.success("Imagens sendo convertidas para PDF...");
      
      // Simulação da conversão
      setTimeout(() => {
        const convertedFileName = `converted_${Date.now()}.pdf`;
        const newFile: FileItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: convertedFileName,
          type: "application/pdf",
          size: 10240, // Tamanho simulado
          lastModified: Date.now(),
          folderId: currentFolder,
          content: "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDEgMCBSIC9MYXN0TW9kaWZpZWQgKEQ6MjAyNDA1MjAwMDAwMDArMDAnMDAnKSAvUmVzb3VyY2VzIDIgMCBSIC9NZWRpYUJveCBbMC4wMDAwMDAgMC4wMDAwMDAgNTk1LjI3NjAwMCA4NDEuODkwMDAwXSAvQ3JvcEJveCBbMC4wMDAwMDAgMC4wMDAwMDAgNTk1LjI3NjAwMCA4NDEuODkwMDAwXSAvQmxlZWRCb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDU5NS4yNzYwMDAgODQxLjg5MDAwMF0gL1RyaW1Cb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDU5NS4yNzYwMDAgODQxLjg5MDAwMF0gL0FydEJveCBbMC4wMDAwMDAgMC4wMDAwMDAgNTk1LjI3NjAwMCA4NDEuODkwMDAwXSAvQ29udGVudHMgNiAwIFIgL1JvdGF0ZSAwIC9Hcm91cCA8PCAvVHlwZSAvR3JvdXAgL1MgL1RyYW5zcGFyZW5jeSAvQ1MgL0RldmljZVJHQiA+PiAvQW5ub3RzIFsgNCAwIFIgXSAvUFogMSA+PgplbmRvYmoKNiAwIG9iago8PC9GaWx0ZXIgL0ZsYXRlRGVjb2RlIC9MZW5ndGggMTc0Pj4gc3RyZWFtCnicXY/BCsIwEEX3+Yp7FhuTptl2KyKCfkIXunARXGlBEEF/v2mb4m4Oh/sC81pchvlhDIsd6JskXXjY2Nh4JzvfgyXY4Bg0VDZGmw5xKS7m/1T34PEiTvTCPq3lFJREBW0srrOH9pu7OVeYZBFmMXy0/iSsUF5UUUP3hKfGVlBCpZ1uUtd17paMoYVvzMchIZt15PgCOAUvNQplbmRzdHJlYW0KZW5kb2JqCjcgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAxIDAgUiAvTGFzdE1vZGlmaWVkIChEOjIwMjQwNTIwMDAwMDAwKzAwJzAwJykgL1Jlc291cmNlcyAyIDAgUiAvTWVkaWFCb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDU5NS4yNzYwMDAgODQxLjg5MDAwMF0gL0Nyb3BCb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDU5NS4yNzYwMDAgODQxLjg5MDAwMF0gL0JsZWVkQm94IFswLjAwMDAwMCAwLjAwMDAwMCA1OTUuMjc2MDAwIDg0MS44OTAwMDBdIC9UcmltQm94IFswLjAwMDAwMCAwLjAwMDAwMCA1OTUuMjc2MDAwIDg0MS44OTAwMDBdIC9BcnRCb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDU5NS4yNzYwMDAgODQxLjg5MDAwMF0gL0NvbnRlbnRzIDggMCBSIC9Sb3RhdGUgMCAvR3JvdXAgPDwgL1R5cGUgL0dyb3VwIC9TIC9UcmFuc3BhcmVuY3kgL0NTI",
        };
        
        setFiles(prev => [...prev, newFile]);
        setConversionOpen(false);
        setFilesToConvert(null);
        toast.success("Conversão concluída! PDF criado com sucesso.");
      }, 1500);
    } 
    else if (conversionType === "slides-to-notes") {
      toast.success("Slides sendo convertidos em anotações...");
      
      // Simulação da conversão
      setTimeout(() => {
        const convertedFileName = `notes_${Date.now()}.txt`;
        const newFile: FileItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: convertedFileName,
          type: "text/plain",
          size: 2048, // Tamanho simulado
          lastModified: Date.now(),
          folderId: currentFolder,
          content: "data:text/plain;base64,QW5vdGHDp8O1ZXMgZ2VyYWRhcyBhIHBhcnRpciBkb3Mgc2xpZGVzOgoKVMOzcGljbyAxOiBJbnRyb2R1w6fDo28KLSBBcHJlc2VudGHDp8OjbyBkbyBjb250ZcO6ZG8KLSBPYmpldGl2b3MgZGEgYXVsYQotIENvbmNlaXRvcyBiw6FzaWNvcwoKVMOzcGljbyAyOiBEZXNlbnZvbHZpbWVudG8KLSBQb250b3MgcHJpbmNpcGFpcwotIEV4ZW1wbG9zIHByw6F0aWNvcwotIEFwbGljYcOnw7VlcyByZWFpcwoKVMOzcGljbyAzOiBDb25jbHVzw6NvCi0gUmVzdW1vIGRvcyBwb250b3MgYWJvcmRhZG9zCi0gUHLDs3hpbW9zIHBhc3NvcwotIFJlZmVyw6puY2lhcyBwYXJhIGVzdHVkbwo=",
        };
        
        setFiles(prev => [...prev, newFile]);
        setConversionOpen(false);
        setFilesToConvert(null);
        toast.success("Conversão concluída! Anotações criadas com sucesso.");
      }, 1500);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Arquivos</h1>
          
          <div className="flex items-center space-x-2 mt-2">
            {getCurrentFolderPath().map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <span className="text-muted-foreground">/</span>}
                <button 
                  onClick={() => handleNavigateToFolder(folder.id)}
                  className="text-sm hover:underline"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar arquivos..."
              className="w-full pl-8 md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                Nova Pasta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Pasta</DialogTitle>
                <DialogDescription>
                  Digite um nome para a nova pasta
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Nome da pasta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewFolderOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateFolder}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="mr-2 h-4 w-4" />
            Enviar Arquivo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
          />

          <Dialog open={conversionOpen} onOpenChange={setConversionOpen}>
            <DialogTrigger asChild>
              <Button>
                <FilePdf className="mr-2 h-4 w-4" />
                Converter Arquivos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Converter Arquivos</DialogTitle>
                <DialogDescription>
                  Selecione os arquivos e o tipo de conversão desejada
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="conversion-type">Tipo de Conversão</Label>
                  <Select 
                    value={conversionType} 
                    onValueChange={(value) => setConversionType(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de conversão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image-to-pdf">Imagens para PDF</SelectItem>
                      <SelectItem value="slides-to-notes">Slides para Anotações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="files">Selecionar Arquivos</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/10"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileImage className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Clique para selecionar</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conversionType === "image-to-pdf" ? "PNG, JPG ou JPEG" : "PPT, PPTX ou PDF"}
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        ref={convertFileInputRef}
                        onChange={(e) => setFilesToConvert(e.target.files)}
                      />
                    </label>
                  </div>
                  {filesToConvert && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {filesToConvert.length} arquivo(s) selecionado(s)
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setConversionOpen(false);
                  setFilesToConvert(null);
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleConvertFiles}>Converter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todos" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentFolder !== "root" && (
              <Card 
                className="flex flex-col items-center justify-center p-4 hover:bg-accent/10 cursor-pointer transition-colors"
                onClick={handleNavigateUp}
              >
                <CardContent className="flex flex-col items-center justify-center pt-6">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Folder className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 font-medium text-center">..</h3>
                </CardContent>
              </Card>
            )}
            
            {folders
              .filter(folder => folder.parentId === currentFolder && folder.id !== "root")
              .map(folder => (
                <Card key={folder.id} className="group relative">
                  <CardContent 
                    className="flex flex-col items-center justify-center p-4 hover:bg-accent/10 cursor-pointer transition-colors"
                    onClick={() => handleNavigateToFolder(folder.id)}
                  >
                    <div className="bg-primary/10 p-4 rounded-full">
                      <Folder className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-4 font-medium text-center truncate max-w-full">{folder.name}</h3>
                  </CardContent>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            
            {filteredFiles.map(file => (
              <Card key={file.id} className="group relative">
                <CardContent className="p-4 hover:bg-accent/10 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center">
                    {file.type.startsWith('image/') && file.thumbnail ? (
                      <div className="h-24 w-24 rounded-md overflow-hidden">
                        <img 
                          src={file.thumbnail} 
                          alt={file.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-secondary/50 p-4 rounded-md">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                    )}
                    <h3 className="mt-4 font-medium text-center truncate max-w-full">{file.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </CardContent>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteFile(file.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
          
          {folders.filter(folder => folder.parentId === currentFolder && folder.id !== "root").length === 0 && 
           filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <File className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Nenhum arquivo encontrado</h3>
              <p className="text-muted-foreground">
                Envie arquivos ou crie pastas para começar.
              </p>
              <div className="flex justify-center mt-4 space-x-4">
                <Button onClick={() => setNewFolderOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Nova Pasta
                </Button>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Enviar Arquivo
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="imagens" className="mt-6">
          {/* Conteúdo para a aba de imagens - mesmo layout, filtrado pelo tipo de arquivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma imagem encontrada</h3>
                <p className="text-muted-foreground">
                  Envie imagens para começar.
                </p>
                <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Enviar Imagem
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="documentos" className="mt-6">
          {/* Conteúdo para a aba de documentos - mesmo layout, filtrado pelo tipo de arquivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhum documento encontrado</h3>
                <p className="text-muted-foreground">
                  Envie documentos para começar.
                </p>
                <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Enviar Documento
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FilesPage;
