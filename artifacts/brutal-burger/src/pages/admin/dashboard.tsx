import { Package, Tag, TrendingUp, AlertTriangle, Coffee, Utensils } from "lucide-react";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { useMemo } from "react";

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Package;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey(),
      staleTime: 30000,
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border h-20 animate-pulse" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do sistema</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Package}
            label="Total de Produtos"
            value={stats?.totalProducts ?? 0}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={Tag}
            label="Categorias"
            value={stats?.totalCategories ?? 0}
            color="bg-blue-500/10 text-blue-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Em Promoção"
            value={stats?.promotionProducts ?? 0}
            color="bg-green-500/10 text-green-400"
          />
          <StatCard
            icon={AlertTriangle}
            label="Esgotados"
            value={stats?.outOfStockProducts ?? 0}
            color="bg-destructive/10 text-destructive"
          />
          <StatCard
            icon={Utensils}
            label="Comidas"
            value={stats?.foodCount ?? 0}
            color="bg-orange-500/10 text-orange-400"
          />
          <StatCard
            icon={Coffee}
            label="Bebidas"
            value={stats?.drinkCount ?? 0}
            color="bg-cyan-500/10 text-cyan-400"
          />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-bold text-foreground mb-2">Status do Cardápio</h2>
          <p className="text-sm text-muted-foreground">
            O cardápio está{" "}
            <span className="text-green-400 font-semibold">ativo</span>{" "}
            com {stats?.totalProducts ?? 0} produtos disponíveis.
            {(stats?.outOfStockProducts ?? 0) > 0 && (
              <span className="text-destructive">
                {" "}{stats?.outOfStockProducts} produto(s) esgotado(s).
              </span>
            )}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
