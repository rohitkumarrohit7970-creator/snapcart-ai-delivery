export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  description: string;
  unit: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "picked" | "out_for_delivery" | "delivered";
  createdAt: string;
  deliveryBoy?: string;
}

export const categories = [
  { id: "groceries", name: "Groceries", icon: "🛒", color: "bg-primary/10" },
  { id: "fruits", name: "Fruits", icon: "🍎", color: "bg-destructive/10" },
  { id: "vegetables", name: "Vegetables", icon: "🥦", color: "bg-primary/10" },
  { id: "milk", name: "Milk & Dairy", icon: "🥛", color: "bg-info/10" },
  { id: "essentials", name: "Daily Essentials", icon: "🧴", color: "bg-accent/10" },
  { id: "medikit", name: "Emergency Medikit", icon: "🩹", color: "bg-destructive/10" },
];

export const products: Product[] = [
  { id: "1", name: "Organic Bananas", category: "fruits", price: 45, originalPrice: 60, stock: 50, image: "🍌", description: "Fresh organic bananas, 1 dozen", unit: "1 dozen" },
  { id: "2", name: "Red Apples", category: "fruits", price: 180, stock: 30, image: "🍎", description: "Premium Shimla apples", unit: "1 kg" },
  { id: "3", name: "Fresh Spinach", category: "vegetables", price: 30, stock: 40, image: "🥬", description: "Farm fresh spinach leaves", unit: "250 g" },
  { id: "4", name: "Tomatoes", category: "vegetables", price: 40, originalPrice: 55, stock: 60, image: "🍅", description: "Vine-ripened tomatoes", unit: "500 g" },
  { id: "5", name: "Full Cream Milk", category: "milk", price: 68, stock: 100, image: "🥛", description: "Amul full cream milk", unit: "1 L" },
  { id: "6", name: "Greek Yogurt", category: "milk", price: 85, stock: 25, image: "🥄", description: "Thick creamy greek yogurt", unit: "400 g" },
  { id: "7", name: "Basmati Rice", category: "groceries", price: 320, originalPrice: 399, stock: 45, image: "🍚", description: "Premium aged basmati rice", unit: "5 kg" },
  { id: "8", name: "Whole Wheat Atta", category: "groceries", price: 265, stock: 55, image: "🌾", description: "Stone ground whole wheat flour", unit: "5 kg" },
  { id: "9", name: "Olive Oil", category: "groceries", price: 450, stock: 20, image: "🫒", description: "Extra virgin olive oil", unit: "500 ml" },
  { id: "10", name: "Dish Soap", category: "essentials", price: 99, originalPrice: 130, stock: 70, image: "🧴", description: "Lemon fresh dish soap", unit: "500 ml" },
  { id: "11", name: "Potatoes", category: "vegetables", price: 35, stock: 80, image: "🥔", description: "Fresh farm potatoes", unit: "1 kg" },
  { id: "12", name: "Mangoes", category: "fruits", price: 250, stock: 15, image: "🥭", description: "Alphonso mangoes", unit: "1 kg" },
  { id: "13", name: "Paneer", category: "milk", price: 120, stock: 35, image: "🧀", description: "Fresh cottage cheese", unit: "200 g" },
  { id: "14", name: "Toothpaste", category: "essentials", price: 85, stock: 90, image: "🪥", description: "Mint fresh toothpaste", unit: "150 g" },
  { id: "15", name: "Sugar", category: "groceries", price: 48, stock: 65, image: "🍬", description: "Refined white sugar", unit: "1 kg" },
  { id: "16", name: "Hand Wash", category: "essentials", price: 110, originalPrice: 145, stock: 50, image: "🧼", description: "Antibacterial hand wash", unit: "250 ml" },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    items: [
      { name: "Organic Bananas", quantity: 2, price: 45 },
      { name: "Full Cream Milk", quantity: 3, price: 68 },
    ],
    total: 294,
    status: "delivered",
    createdAt: "2026-02-27",
    deliveryBoy: "Rajesh K.",
  },
  {
    id: "ORD-002",
    items: [
      { name: "Basmati Rice", quantity: 1, price: 320 },
      { name: "Olive Oil", quantity: 1, price: 450 },
    ],
    total: 770,
    status: "out_for_delivery",
    createdAt: "2026-02-28",
    deliveryBoy: "Suresh M.",
  },
];
