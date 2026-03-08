# 🛒 SnapCart — Smart Grocery Delivery Platform

SnapCart is a full-stack grocery delivery web application with role-based dashboards for **Users**, **Delivery Heroes**, and **Admins**. Built with React, TypeScript, and Lovable Cloud.

---

## ✨ Features

### 👤 User Portal
- Browse & search grocery products by category
- Add items to cart and place orders
- Real-time order tracking
- Manage saved delivery addresses
- AI-powered grocery chatbot assistant
- Raise support tickets & complaints
- Product reviews & ratings
- Emergency Medikit essentials

### 🚚 Delivery Hero Dashboard
- View and manage assigned deliveries
- Live map with delivery route tracking
- Update order status in real-time
- Dashboard with delivery stats

### 🛡️ Admin Dashboard
- Overview dashboard with key metrics (orders, revenue, users, stock alerts)
- Full order history with delivery hero assignments
- User management with purchase history insights
- Product inventory management
- Complaints management with admin responses
- Support chat monitoring

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React 18, TypeScript, Vite        |
| Styling      | Tailwind CSS, shadcn/ui           |
| State        | Zustand, TanStack React Query     |
| Routing      | React Router v6                   |
| Maps         | Leaflet / React Leaflet           |
| Backend      | Lovable Cloud                     |
| Auth         | Email/password with role-based access |
| AI           | Edge functions with Lovable AI    |

---

## 🔐 Role-Based Access

| Role          | Routes                     |
|---------------|-----------------------------|
| User          | `/`, `/cart`, `/orders`, `/support`, `/addresses` |
| Delivery Hero | `/delivery`, `/delivery/orders`, `/delivery/map`  |
| Admin         | `/admin`, `/admin/products`, `/admin/orders`, `/admin/users`, `/admin/complaints`, `/admin/support` |

Roles are stored in a dedicated `user_roles` table and enforced via RLS policies and protected routes.

---

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Sign up on the `/welcome` page and select your role

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layouts/          # AdminLayout, DeliveryLayout
│   ├── ui/               # shadcn/ui components
│   └── user/             # Navbar, ProductCard, CategoryBar, GroceryChatbot
├── hooks/                # useAuth, useProducts, useAddresses, etc.
├── lib/                  # Zustand stores, mock data, utilities
├── pages/
│   ├── admin/            # Admin dashboard pages
│   ├── auth/             # Login & Register
│   └── delivery/         # Delivery hero pages
└── integrations/         # Cloud client & types
```

---

## 📄 License

Private project — all rights reserved.
