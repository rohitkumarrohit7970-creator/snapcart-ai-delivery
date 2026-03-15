import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Clock, Leaf, Info } from "lucide-react";
import type { DbProduct } from "@/hooks/useProducts";
import { useCartStore } from "@/lib/cart-store";

interface ProductDetailDialogProps {
  product: DbProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  if (!product) return null;

  const cartProduct = {
    id: product.id,
    name: product.name,
    category: product.category_id ?? "",
    price: Number(product.price),
    originalPrice: product.original_price ? Number(product.original_price) : undefined,
    stock: product.stock,
    image: product.image,
    description: product.description,
    unit: product.unit,
  };

  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const varieties = product.variety?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Product image & price */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-24 w-24 rounded-xl bg-secondary text-6xl shrink-0">
              {product.image}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{product.unit}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">₹{Number(product.price)}</span>
                {product.original_price && (
                  <span className="text-sm text-muted-foreground line-through">₹{Number(product.original_price)}</span>
                )}
              </div>
              {product.original_price && (
                <Badge variant="destructive" className="text-[10px]">
                  {Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Info className="h-4 w-4 text-primary" />
                About
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Varieties / Breed Types */}
          {varieties.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Leaf className="h-4 w-4 text-primary" />
                Available Varieties
              </div>
              <div className="flex flex-wrap gap-2">
                {varieties.map((v) => (
                  <Badge key={v} variant="secondary" className="text-xs font-medium">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Shelf Life / Expiry */}
          {product.shelf_life && (
            <div className="rounded-xl border bg-secondary/50 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-accent" />
                Shelf Life & Freshness
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.shelf_life}</p>
              {product.best_before_days && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (product.best_before_days / 30) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">
                    ~{product.best_before_days} days
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Add to cart */}
          <div className="pt-1">
            {quantity === 0 ? (
              <Button className="w-full gap-2" onClick={() => addItem(cartProduct)}>
                <Plus className="h-4 w-4" /> Add to Cart
              </Button>
            ) : (
              <div className="flex items-center justify-between rounded-xl border bg-primary/5 p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => (quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-base font-bold text-foreground">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
