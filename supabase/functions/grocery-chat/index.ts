import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch available products to give context to AI
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products } = await supabase
      .from("products")
      .select("id, name, price, unit, category_id, image, description, original_price, stock")
      .eq("is_active", true);

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name")
      .order("sort_order");

    const catMap = Object.fromEntries((categories || []).map((c: any) => [c.id, c.name]));
    const productList = (products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      category: catMap[p.category_id] || "Other",
      image: p.image,
      inStock: p.stock > 0,
    }));

    const systemPrompt = `You are SnapCart's friendly grocery shopping assistant. Help users find and choose groceries.

AVAILABLE PRODUCTS (use ONLY these):
${JSON.stringify(productList, null, 2)}

RULES:
1. Recommend products ONLY from the list above.
2. When suggesting products, ALWAYS use this exact format for each product so the app can parse it:
   [PRODUCT:{"id":"<id>","name":"<name>","price":<price>,"image":"<image>"}]
3. You can suggest meal ideas, shopping lists, dietary recommendations etc. but always reference real products.
4. Be concise, friendly, and helpful. Use emojis sparingly.
5. If asked about a product not in the catalog, say it's not currently available and suggest alternatives.
6. Group recommendations logically (e.g., by meal, by category).
7. **IMPORTANT**: When a user asks about emergencies, first aid, health kits, or safety supplies, ALWAYS proactively recommend relevant items from the "Emergency Medikit" category. Suggest building a complete first aid kit.
8. When greeting users or when they ask "what's new", mention the Emergency Medikit category as a featured/recommended collection.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("grocery-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
