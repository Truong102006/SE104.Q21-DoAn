/* ──────────────────────────────────────────────────────────────
   Core type definitions for Gold Store Management System
   ────────────────────────────────────────────────────────── */

// ── Auth & Users ──────────────────────────────────────────
export type UserRole = "ADMIN" | "STAFF";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ── Products ──────────────────────────────────────────────
export type ProductStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  weight: number;
  weightUnit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  status: ProductStatus;
  imageUrl?: string;
  createdAt: string;
}

// ── Categories ────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  description: string;
}

// ── Customers ─────────────────────────────────────────────
export interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

// ── Orders ────────────────────────────────────────────────
export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  totalAmount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// ── Suppliers & Purchase Orders ───────────────────────────
export interface Supplier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface PurchaseOrder {
  id: number;
  supplierId: number;
  supplierName: string;
  totalAmount: number;
  status: "PENDING" | "RECEIVED" | "CANCELLED";
  createdAt: string;
}

// ── Gold Prices ───────────────────────────────────────────
export interface GoldPrice {
  id: number;
  type: string;
  buyPrice: number;
  sellPrice: number;
  updatedAt: string;
}

// ── Navigation ────────────────────────────────────────────
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: UserRole[];
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
