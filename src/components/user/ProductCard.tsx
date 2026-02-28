import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/mock-data";
import { useCartStore } from "@/lib/cart-store";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="group relative flex flex-col rounded-xl border bg-card p-3 snap-card-shadow snap-card-hover animate-fade-in">
      {product.originalPrice && (
        <span className="absolute top-2 left-2 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
        </span>
      )}

      <div className="flex items-center justify-center py-4 text-5xl">
        {product.image}
      </div>

      <div className="mt-auto space-y-1">
        <p className="text-xs text-muted-foreground">{product.unit}</p>
        <h3 className="text-sm font-semibold leading-tight text-card-foreground line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>

        <div className="pt-1">
          {quantity === 0 ? (
            <Button
              size="sm"
              className="w-full text-xs h-8"
              onClick={() => addItem(product)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          ) : (
            <div className="flex items-center justify-between rounded-lg border bg-primary/5 p-0.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() =>
                  quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1)
                }
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="text-sm font-semibold text-foreground">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => updateQuantity(product.id, quantity + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
