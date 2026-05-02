import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  getListCategoriesQueryKey,
  getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: "" });
    setDialogOpen(true);
  };

  const openEdit = (id: string, name: string) => {
    setEditingId(id);
    form.reset({ name });
    setDialogOpen(true);
  };

  const onSubmit = (data: CategoryFormValues) => {
    if (editingId !== null) {
      updateMutation.mutate(
        { id: editingId as any, data },
        {
          onSuccess: () => { toast.success("Categoria atualizada"); setDialogOpen(false); invalidate(); },
          onError: () => toast.error("Erro ao atualizar categoria"),
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => { toast.success("Categoria criada"); setDialogOpen(false); invalidate(); },
          onError: () => toast.error("Erro ao criar categoria"),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(
      { id: id as any },
      {
        onSuccess: () => { toast.success("Categoria removida"); setDeleteId(null); invalidate(); },
        onError: () => toast.error("Erro ao remover categoria"),
      }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Categorias</h1>
            <p className="text-muted-foreground text-sm mt-1">{categories.length} categoria(s)</p>
          </div>
          <Button onClick={openCreate} data-testid="button-create-category">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border h-14 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
            Nenhuma categoria cadastrada. Crie a primeira!
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                data-testid={`row-category-${cat.id}`}
                className={`flex items-center justify-between px-6 py-4 ${i < categories.length - 1 ? "border-b border-border/50" : ""} hover:bg-muted/20 transition-colors`}
              >
                <div>
                  <p className="font-semibold text-foreground">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Criada em {format(new Date(cat.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(cat.id, cat.name)}
                    data-testid={`btn-edit-category-${cat.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(cat.id)}
                    data-testid={`btn-delete-category-${cat.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>
              {editingId !== null ? "Altere o nome da categoria selecionada." : "Digite o nome da nova categoria para o cardápio."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Burgers, Combos..." {...field} data-testid="input-category-name" autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-category">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta categoria? Os produtos desta categoria ficarão sem categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && handleDelete(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-category"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
