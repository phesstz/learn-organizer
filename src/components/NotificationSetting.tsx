
import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export type NotificationSettings = {
  enabled: boolean;
  reminderTime: "30min" | "1hour" | "1day" | "1week";
};

interface NotificationSettingProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
}

const NotificationSetting = ({ settings, onSettingsChange }: NotificationSettingProps) => {
  const [open, setOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setOpen(false);
    
    if (localSettings.enabled) {
      toast.success("Notificações ativadas", {
        description: `Você receberá lembretes ${
          localSettings.reminderTime === "30min" ? "30 minutos" :
          localSettings.reminderTime === "1hour" ? "1 hora" :
          localSettings.reminderTime === "1day" ? "1 dia" :
          "1 semana"
        } antes dos eventos.`,
      });
    } else {
      toast.info("Notificações desativadas");
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setOpen(true)}
        className="relative"
      >
        {settings.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {settings.enabled && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações de Notificação</DialogTitle>
            <DialogDescription>
              Configure como e quando deseja receber lembretes para seus eventos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-active">Ativar notificações</Label>
              <Switch 
                id="notifications-active" 
                checked={localSettings.enabled}
                onCheckedChange={(checked) => 
                  setLocalSettings({...localSettings, enabled: checked})
                }
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reminder-time">Lembrar com antecedência</Label>
              <Select 
                value={localSettings.reminderTime}
                onValueChange={(value) => 
                  setLocalSettings({
                    ...localSettings, 
                    reminderTime: value as "30min" | "1hour" | "1day" | "1week"
                  })
                }
                disabled={!localSettings.enabled}
              >
                <SelectTrigger id="reminder-time">
                  <SelectValue placeholder="Selecione o tempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30min">30 minutos</SelectItem>
                  <SelectItem value="1hour">1 hora</SelectItem>
                  <SelectItem value="1day">1 dia</SelectItem>
                  <SelectItem value="1week">1 semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationSetting;
