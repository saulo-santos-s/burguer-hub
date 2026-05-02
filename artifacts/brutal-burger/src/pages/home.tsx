import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Tag, AlertCircle, Lock, Plus, Minus, Trash2, X, MessageCircle } from "lucide-react";
import { useListProducts, useListCategories, getListProductsQueryKey, type ListProductsParams } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { formatPrice } from "@/lib/format";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

type TabType = "all" | "food" | "drink";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [, navigate] = useLocation();
  const keySequenceRef = useRef<string>("");
  const keyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keySequenceRef.current += e.key.toLowerCase();
      if (keySequenceRef.current.length > 5) keySequenceRef.current = keySequenceRef.current.slice(-5);
      if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
      keyTimerRef.current = setTimeout(() => { keySequenceRef.current = ""; }, 1500);
      if (keySequenceRef.current.endsWith("admin")) navigate("/admin");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const params = useMemo((): ListProductsParams => {
    const p: ListProductsParams = {};
    if (activeTab === "food") p.type = "food";
    if (activeTab === "drink") p.type = "drink";
    if (activeCategoryId !== null) p.categoryId = activeCategoryId;
    return p;
  }, [activeTab, activeCategoryId]);

  const { data: products = [], isLoading } = useListProducts(params, {
    query: { 
      queryKey: getListProductsQueryKey(params), 
      staleTime: 30000,
    },
  });

  const productList = Array.isArray(products) ? products : [];

  const { data: categories = [] } = useListCategories({
    query: { queryKey: ["categories"] },
  });

  // Safe access to categories since it might not be an array initially or if the API fails
  const categoryList = Array.isArray(categories) ? categories : [];

  const tabs: { id: TabType; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "food", label: "Comidas" },
    { id: "drink", label: "Bebidas" },
  ];

  const addToCart = (product: { id: string; name: string; price: number; imageUrl?: string | null }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1 }];
    });
  };

  const removeOne = (id: string) => {
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, quantity: i.quantity - 1 } : i).filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const getCartQty = (id: string) => cart.find((i) => i.id === id)?.quantity ?? 0;

  const sendWhatsApp = () => {
    if (cart.length === 0) return;
    const lines = cart.map((i) => `✅ *${i.name}* x${i.quantity} — ${formatPrice(i.price * i.quantity)}`).join("\n");
    const message = `🍔 *NOVO PEDIDO - BRUTAL BURGER* 🍔\n\n${lines}\n\n💰 *Total: ${formatPrice(cartTotal)}*\n\n📍 _Por favor, confirme os detalhes da entrega._`;
    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

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

          {/* Cart button in header */}
          <button
            onClick={() => setCartOpen(true)}
            data-testid="btn-open-cart"
            className="relative flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card to-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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

        {/* Category filter */}
        {(activeTab === "all" || activeTab === "food") && categoryList.length > 0 && (
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
            {categoryList.map((cat) => (
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
        ) : productList.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productList.map((product, i) => {
              const qty = getCartQty(product.id);
              const outOfStock = product.quantity <= 0;
              return (
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
                        loading="lazy"
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? "grayscale opacity-60" : ""}`}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-4xl opacity-20 ${outOfStock ? "grayscale" : ""}`}>🍔</div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                      {product.promotion && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          Promoção
                        </span>
                      )}
                      {outOfStock && (
                        <span className="bg-destructive text-destructive-foreground text-[10px] font-black uppercase px-2 py-0.5 rounded-full z-10">
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
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-black text-primary" data-testid={`text-price-${product.id}`}>
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {/* Add to cart */}
                    {outOfStock ? (
                      <div className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-semibold bg-muted text-muted-foreground opacity-50 cursor-not-allowed">
                        Esgotado
                      </div>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => addToCart(product)}
                        data-testid={`btn-add-cart-${product.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => removeOne(product.id)}
                          data-testid={`btn-dec-cart-${product.id}`}
                          className="w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-black text-foreground text-sm flex-1 text-center">{qty}</span>
                        <button
                          onClick={() => addToCart(product)}
                          data-testid={`btn-inc-cart-${product.id}`}
                          className="w-9 h-9 rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
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

      {/* Cart Drawer overlay */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border z-50 flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-title"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h2 className="font-black text-lg uppercase tracking-tight" id="cart-title">Carrinho</h2>
                  {cartCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-black px-2 py-0.5 rounded-full">
                      {cartCount} {cartCount === 1 ? "item" : "itens"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  data-testid="btn-close-cart"
                  aria-label="Fechar carrinho"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center py-20">
                    <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-semibold text-sm">Seu carrinho está vazio</p>
                    <p className="text-xs mt-1">Adicione itens do cardápio para começar</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-background rounded-xl border border-border p-3 flex items-center gap-3"
                        data-testid={`cart-item-${item.id}`}
                      >
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">🍔</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-primary font-black">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => removeOne(item.id)}
                            className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                            data-testid={`cart-dec-${item.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center transition-all"
                            data-testid={`cart-inc-${item.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-7 h-7 rounded-lg text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors ml-1"
                            data-testid={`cart-remove-${item.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer with total + send */}
              {cart.length > 0 && (
                <div className="border-t border-border px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm font-medium">Total do pedido</span>
                    <span className="text-xl font-black text-primary">{formatPrice(cartTotal)}</span>
                  </div>
                  <button
                    onClick={sendWhatsApp}
                    data-testid="btn-send-whatsapp"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-sm bg-[#25D366] text-white hover:bg-[#1ebe59] active:scale-95 transition-all uppercase tracking-wide"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Enviar Pedido no WhatsApp
                  </button>
                  <button
                    onClick={() => setCart([])}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                    data-testid="btn-clear-cart"
                  >
                    Limpar carrinho
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
