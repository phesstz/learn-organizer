
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Copy, Download, FileText, Image, ScanText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OCR = () => {
  const { toast } = useToast();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Limpar texto extraído anterior
      setExtractedText("");
    }
  };
  
  const processImage = () => {
    if (!image) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simular o processamento OCR com um atraso
    // Em uma implementação real, aqui chamaríamos uma API de OCR
    setTimeout(() => {
      // Texto de exemplo extraído - em uma implementação real, isso viria da API
      const mockExtractedText = "Este é um texto extraído de exemplo.\n\nEm uma implementação real, este texto seria obtido através de uma API de OCR como o Tesseract.js, Google Cloud Vision, ou outras ferramentas de OCR.\n\nO texto extraído apareceria neste campo, pronto para ser copiado ou salvo como nota.";
      
      setExtractedText(mockExtractedText);
      setIsProcessing(false);
      
      toast({
        title: "Texto extraído com sucesso",
        description: "O texto foi extraído da imagem.",
      });
    }, 2000);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Texto copiado",
      description: "O texto foi copiado para a área de transferência.",
    });
  };
  
  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([extractedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "texto_extraido.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const clearAll = () => {
    setImage(null);
    setImagePreview(null);
    setExtractedText("");
  };

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Reconhecimento de Texto (OCR)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Digitalizar Texto</CardTitle>
            <CardDescription>
              Carregue uma imagem para extrair o texto contido nela
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="image-upload" className="text-sm font-medium">
                Selecione uma imagem
              </label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={processImage} 
              disabled={!image || isProcessing} 
              className="w-full"
            >
              {isProcessing ? (
                <>Processando...</>
              ) : (
                <>
                  <ScanText className="mr-2 h-4 w-4" />
                  Extrair Texto
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearAll} 
              className="w-full"
            >
              Limpar
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Texto Extraído</CardTitle>
            <CardDescription>
              Texto identificado na imagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="O texto extraído aparecerá aqui..."
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={copyToClipboard} 
              disabled={!extractedText}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
            
            <Button 
              onClick={downloadText} 
              disabled={!extractedText}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Como funciona:</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Camera className="mr-2 h-5 w-5 text-primary" />
                Passo 1: Capture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tire uma foto de um documento, caderno ou qualquer texto impresso.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ScanText className="mr-2 h-5 w-5 text-primary" />
                Passo 2: Processe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                O OCR analisa a imagem e extrai o texto automaticamente.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Passo 3: Utilize
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use o texto extraído para criar notas, resumos ou lembretes em segundos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OCR;
