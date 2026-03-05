import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export interface ProfileForQuiz {
  id: string;
  name: string;
  image: string | null;
  gallery: string[];
}

export interface AdminQuizImageSelectorProps {
  profiles: ProfileForQuiz[];
  value: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export function AdminQuizImageSelector({
  profiles,
  value,
  onChange,
  label = "Imagen de la pregunta",
  disabled,
}: AdminQuizImageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProfile = selectedProfileId
    ? profiles.find((p) => p.id === selectedProfileId)
    : null;

  const imagesFromProfile = selectedProfile
    ? [
        ...(selectedProfile.image ? [selectedProfile.image] : []),
        ...(selectedProfile.gallery ?? []),
      ].filter(Boolean)
    : [];

  const handleSelectImage = (url: string) => {
    onChange(url);
    setOpen(false);
    setSelectedProfileId(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedProfileId(null);
    setOpen(next);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !supabase) return;
    const valid = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
    if (!valid) return;
    if (file.size > 5 * 1024 * 1024) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `quiz/quiz-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("escort-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("escort-images").getPublicUrl(path);
      onChange(publicUrl);
      setOpen(false);
    } catch {
      // silent fail or could set error state
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full h-auto min-h-[100px] flex flex-col items-center justify-center gap-2 p-3 border-dashed",
              value && "border-copper/50 bg-copper/5"
            )}
            disabled={disabled}
          >
            {value ? (
              <>
                <img
                  src={value}
                  alt="Seleccionada"
                  className="max-h-20 w-auto rounded object-cover"
                />
                <span className="text-xs text-muted-foreground">Cambiar imagen</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Seleccionar imagen de perfil activo
                </span>
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Elegir imagen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 overflow-y-auto min-h-0">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Subir desde dispositivo</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Subiendo…" : "Subir desde dispositivo"}
              </Button>
            </div>
            <div className="border-t border-border pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">O elegir de perfiles con promoción</p>
            </div>
            {!selectedProfileId ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Elige un perfil activo. Luego elige una foto de ese perfil.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {profiles.length === 0 ? (
                    <p className="col-span-full text-sm text-muted-foreground">
                      No hay perfiles activos publicados.
                    </p>
                  ) : (
                    profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProfileId(p.id)}
                        className="rounded-xl border border-border overflow-hidden hover:border-copper/50 hover:bg-copper/5 transition-colors text-left"
                      >
                        <div className="aspect-square bg-muted">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              Sin foto
                            </div>
                          )}
                        </div>
                        <p className="p-2 text-xs font-medium truncate">{p.name}</p>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProfileId(null)}
                  >
                    ← Otro perfil
                  </Button>
                  <span className="text-sm font-medium">{selectedProfile?.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Elige una foto para esta pregunta:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {imagesFromProfile.length === 0 ? (
                    <p className="col-span-full text-sm text-muted-foreground">
                      Este perfil no tiene fotos.
                    </p>
                  ) : (
                    imagesFromProfile.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => handleSelectImage(url)}
                        className="rounded-xl border border-border overflow-hidden hover:border-copper hover:ring-2 ring-copper/30 transition-all"
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full aspect-square object-cover"
                        />
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
