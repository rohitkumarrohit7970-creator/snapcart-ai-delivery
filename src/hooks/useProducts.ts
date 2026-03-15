import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image: string;
  description: string;
  unit: string;
  is_active: boolean;
  variety: string | null;
  shelf_life: string | null;
  best_before_days: number | null;
}

export interface DbCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as DbCategory[];
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data as DbProduct[];
    },
  });
}
