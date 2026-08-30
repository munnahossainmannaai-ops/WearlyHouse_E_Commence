export interface ColorVariant {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  compareAt?: number;
  stock: number;
  rating: number;
  ratingCount: number;
  colors: ColorVariant[];
  image: string;
  tags: string[];
  featured?: boolean;
  description: string;
  specs: { label: string; value: string }[];
  createdAt: number;
}

export interface CartItem {
  productId: string;
  qty: number;
  color: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passHash: string;
  role: "customer" | "admin";
  addresses: Address[];
  createdAt: number;
  active: boolean;
}

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  qty: number;
  price: number;
}

export interface OrderTimelineEntry {
  status: OrderStatus | "placed";
  at: number;
  note: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  address: Address;
  shippingMethod: string;
  shippingCost: number;
  discount: number;
  subtotal: number;
  total: number;
  last4: string;
  status: OrderStatus;
  timeline: OrderTimelineEntry[];
  createdAt: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  date: number;
}

export interface Toast {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  message?: string;
}

export type Category = {
  id: string;
  name: string;
  blurb: string;
};

export interface Promo {
  code: string;
  pct: number;
  active: boolean;
  redemptions: number;
}

export interface AuditEntry {
  id: string;
  at: number;
  actor: string;
  action: string;
  detail: string;
}

export interface RestockRequest {
  id: string;
  productId: string;
  email: string;
  at: number;
}
