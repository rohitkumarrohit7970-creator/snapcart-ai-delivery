import { useState } from "react";
import { Navbar } from "@/components/user/Navbar";
import { CategoryBar } from "@/components/user/CategoryBar";
import { ProductCard } from "@/components/user/ProductCard";
import { GroceryChatbot } from "@/components/user/GroceryChatbot";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { Search } from "lucide-react";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category_id === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pb-8">
        {/* Hero */}
        <div className="mt-4 rounded-2xl snap-green-gradient p-6 md:p-8 text-primary-foreground">
          <h1 className="text-2xl md:text-3xl font-bold">Groceries delivered</h1>
          <p className="text-lg md:text-xl font-semibold opacity-90">in 10 minutes</p>
          <p className="mt-2 text-sm opacity-80">Fresh produce, daily essentials & more</p>
        </div>

        {/* Mobile search */}
        <div className="mt-4 md:hidden relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for groceries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Categories */}
        <CategoryBar categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* Products */}
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-3 h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mt-2">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!productsLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No products found</p>
            <p className="text-sm mt-1">Try a different category or search term</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
