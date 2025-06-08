
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ImageIcon, Save, RotateCcw, Loader2 } from "lucide-react";
import Link from "next/link";

const LOCALSTORAGE_LOGO_URL_KEY = "customLogoUrl";
const LOCALSTORAGE_LOGO_TEXT_KEY = "customLogoText";
const DEFAULT_LOGO_TEXT = "Gestor Brigada";

export default function AppearanceSettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [logoUrl, setLogoUrl] = useState("");
  const [logoText, setLogoText] = useState(DEFAULT_LOGO_TEXT);
  
  useEffect(() => {
    const storedLogoUrl = localStorage.getItem(LOCALSTORAGE_LOGO_URL_KEY);
    const storedLogoText = localStorage.getItem(LOCALSTORAGE_LOGO_TEXT_KEY);
    if (storedLogoUrl) setLogoUrl(storedLogoUrl);
    if (storedLogoText) setLogoText(storedLogoText);
  }, []);

  const handleSaveLogo = () => {
    setIsSubmitting(true);
    try {
        localStorage.setItem(LOCALSTORAGE_LOGO_URL_KEY, logoUrl);
        localStorage.setItem(LOCALSTORAGE_LOGO_TEXT_KEY, logoText);
        toast({ title: "Logo Actualizado", description: "Los cambios en el logo se han guardado en este navegador." });
        window.dispatchEvent(new Event('customLogoChanged'));
    } catch (e) {
        toast({ title: "Error", description: "No se pudo guardar el logo.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRestoreDefaultLogo = () => {
    setIsSubmitting(true);
    try {
        setLogoUrl("");
        setLogoText(DEFAULT_LOGO_TEXT);
        localStorage.removeItem(LOCALSTORAGE_LOGO_URL_KEY);
        localStorage.removeItem(LOCALSTORAGE_LOGO_TEXT_KEY);
        toast({ title: "Logo Restaurado", description: "El logo ha sido restaurado a los valores por defecto." });
        window.dispatchEvent(new Event('customLogoChanged'));
    } catch (e) {
        toast({ title: "Error", description: "No se pudo restaurar el logo.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
      </Button>

      <div>
        <h1 className="text-3xl font-headline font-bold flex items-center">
          <ImageIcon className="mr-3 h-7 w-7 text-primary" />
          Personalización del Logo
        </h1>
        <p className="text-muted-foreground mt-1">
          Ajusta el logo y el texto que se muestra en la barra de navegación. Los cambios son locales a tu navegador.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> Configuración del Logo</CardTitle>
          <CardDescription>Personaliza el logo y el texto que se muestra en la barra de navegación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="logoUrl">URL de la Imagen del Logo (Opcional)</Label>
            <Input 
              id="logoUrl" 
              placeholder="https://ejemplo.com/logo.png" 
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Pega la URL de una imagen alojada externamente. La subida de archivos no está soportada.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="logoText">Texto del Logo</Label>
            <Input 
              id="logoText" 
              placeholder="Nombre de tu Brigada" 
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleSaveLogo} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
              Guardar Logo
            </Button>
            <Button variant="outline" onClick={handleRestoreDefaultLogo} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Restaurar Logo
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
    
    
    
