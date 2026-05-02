import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            A página que você procura não existe ou foi movida.
          </p>
          
          <div className="mt-6">
            <a href="/" className="text-primary hover:underline font-bold text-sm uppercase tracking-widest">
              &larr; Voltar para o Início
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
