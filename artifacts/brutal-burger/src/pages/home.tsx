import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Tag, AlertCircle, Lock } from "lucide-react";
import { useListProducts, useListCategories, getListProductsQueryKey, type ListProductsParams } from "@workspace/api-client-react";
import { useLocation } from "wouter";

function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function WhatsAppButton({ product }: { product: { name: string; price: number; quantity: number } }) {
  const isOutOfStock = product.quantity <= 0;

  const handleClick = () => {
    const message = `Olá, quero pedir:\n🍔 ${product.name} - ${formatPrice(product.price)}`;
    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      disabled={isOutOfStock}
      data-testid={`btn-whatsapp-${product.name}`}
      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
        isOutOfStock
          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
      }`}
    >
      <ShoppingBag className="w-4 h-4" />
      {isOutOfStock ? "Esgotado" : "Pedir no WhatsApp"}
    </button>
  );
}

type TabType = "all" | "food" | "drink";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const keySequenceRef = useRef<string>("");
  const keyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keySequenceRef.current += e.key.toLowerCase();
      if (keySequenceRef.current.length > 5) {
        keySequenceRef.current = keySequenceRef.current.slice(-5);
      }
      if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
      keyTimerRef.current = setTimeout(() => { keySequenceRef.current = ""; }, 1500);
      if (keySequenceRef.current.endsWith("admin")) {
        navigate("/admin");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const params: ListProductsParams = {};
  if (activeTab === "food") params.type = "food";
  if (activeTab === "drink") params.type = "drink";
  if (activeCategoryId !== null) params.categoryId = activeCategoryId;

  const { data: products = [], isLoading } = useListProducts(params, {
    query: {
      queryKey: getListProductsQueryKey(params),
      refetchInterval: 30000,
    },
  });

  const { data: categories = [] } = useListCategories({
    query: {
      queryKey: ["categories"],
    },
  });

  const tabs: { id: TabType; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "food", label: "Comidas" },
    { id: "drink", label: "Bebidas" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">
              BRUTAL<span className="text-primary">BURGER</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Cardápio Digital</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card to-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-3">Artesanal & Brutal</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
              Sabor que<br /><span className="text-primary">Respeita</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Ingredientes frescos, blends selecionados e receitas que ficam na memória.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveCategoryId(null); }}
              data-testid={`tab-${tab.id}`}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category filter - only show for food tab or all */}
        {(activeTab === "all" || activeTab === "food") && categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setActiveCategoryId(null)}
              data-testid="filter-all-categories"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeCategoryId === null
                  ? "bg-secondary text-foreground border-border"
                  : "bg-transparent text-muted-foreground border-border/50 hover:border-border"
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                data-testid={`filter-cat-${cat.id}`}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  activeCategoryId === cat.id
                    ? "bg-secondary text-foreground border-border"
                    : "bg-transparent text-muted-foreground border-border/50 hover:border-border"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border animate-pulse h-80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                data-testid={`card-product-${product.id}`}
                className="bg-card rounded-xl border border-border overflow-hidden flex flex-col group hover:border-primary/40 transition-colors"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                      🍔
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    {product.promotion && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        Promoção
                      </span>
                    )}
                    {product.quantity <= 0 && (
                      <span className="bg-destructive text-destructive-foreground text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        Esgotado
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-foreground text-sm leading-tight" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </h3>
                    {product.categoryName && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                        {product.categoryName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-black text-primary" data-testid={`text-price-${product.id}`}>
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <WhatsAppButton product={product} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border py-8 text-muted-foreground text-xs relative">
        <div className="text-center">
          <p className="font-black text-sm uppercase tracking-widest text-foreground mb-1">BRUTAL BURGER</p>
          <p>Todos os direitos reservados &copy; {new Date().getFullYear()}</p>
        </div>
        <button
          onClick={() => navigate("/admin")}
          title=""
          aria-label=""
          className="absolute bottom-6 right-6 opacity-20 hover:opacity-60 transition-opacity duration-300 text-muted-foreground focus:outline-none"
          tabIndex={-1}
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </footer>
    </div>
  );
}
