import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useAdminLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Package, Tags, LogOut, Loader2, Menu, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: 1,
    }
  });

  const logoutMutation = useAdminLogout();

  useEffect(() => {
    if (!isLoading && isError) {
      setLocation("/admin");
    }
  }, [isLoading, isError, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("brutal_burger_token");
        queryClient.clear();
        setLocation("/admin");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const NavLinks = () => (
    <>
      <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors">
        <LayoutDashboard className="w-5 h-5" />
        Dashboard
      </Link>
      <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors">
        <Package className="w-5 h-5" />
        Produtos
      </Link>
      <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors">
        <Tags className="w-5 h-5" />
        Categorias
      </Link>
      <div className="pt-4 mt-4 border-t border-border/50">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors font-medium">
          <ExternalLink className="w-5 h-5" />
          Ver Site Público
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-black tracking-tighter uppercase text-primary">BRUTAL ADMIN</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-border">
          <div className="mb-4 px-3">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:hidden">
          <h1 className="text-lg font-black tracking-tighter uppercase text-primary">BRUTAL ADMIN</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-background border-border p-0 flex flex-col">
              <div className="p-6 border-b border-border">
                <h1 className="text-xl font-black tracking-tighter uppercase text-primary">BRUTAL ADMIN</h1>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                <NavLinks />
              </nav>
              <div className="p-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 mr-3" />
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
