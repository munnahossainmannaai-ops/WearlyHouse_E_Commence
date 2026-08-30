import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address, CartItem, Order, OrderItem, OrderStatus, Product, Promo, RestockRequest, Review, Toast, User } from "../lib/types";
import { PRODUCTS, seedReviews } from "../data/catalog";
import { hashPass, uid } from "../lib/utils";

export type ThemeName = "void" | "cleanroom";

interface Store {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  user: User | null;
  users: User[];
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  reviews: Review[];
  toasts: Toast[];
  cartOpen: boolean;

  setCartOpen: (v: boolean) => void;
  toast: (kind: Toast["kind"], title: string, message?: string) => void;
  dismissToast: (id: string) => void;

  login: (email: string, pass: string) => string | null;
  signup: (name: string, email: string, pass: string) => string | null;
  quickLogin: (email: string) => void;
  googleLogin: () => void;
  logout: () => void;
  updateProfile: (name: string, email: string) => void;
  changePassword: (current: string, next: string) => string | null;
  saveAddress: (addr: Omit<Address, "id"> & { id?: string }) => void;
  deleteAddress: (id: string) => void;

  addToCart: (productId: string, color: string, qty?: number) => void;
  setQty: (productId: string, color: string, qty: number) => void;
  removeFromCart: (productId: string, color: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  recentlyViewed: string[];
  recordView: (productId: string) => void;
  reorder: (items: OrderItem[]) => void;

  views: Record<string, number>;
  freeShipThreshold: number;
  setFreeShipThreshold: (n: number) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (n: number) => void;
  promos: Promo[];
  addPromo: (code: string, pct: number) => string | null;
  removePromo: (code: string) => void;
  togglePromo: (code: string) => void;
  restockRequests: RestockRequest[];
  requestRestock: (productId: string, email: string) => void;

  placeOrder: (o: {
    address: Address;
    shippingMethod: string;
    shippingCost: number;
    discount: number;
    last4: string;
  }) => Order;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;

  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  setStock: (id: string, stock: number) => void;

  addReview: (productId: string, rating: number, title: string, body: string) => void;
}

const seedUsers: User[] = [
  {
    id: "u-admin",
    name: "House Admin",
    email: "admin@nova.supply",
    passHash: hashPass("nova-admin"),
    role: "admin",
    addresses: [],
    createdAt: Date.now() - 400 * 86_400_000,
    active: true,
  },
  {
    id: "u-demo",
    name: "Kai Demo",
    email: "demo@nova.space",
    passHash: hashPass("demo1234"),
    role: "customer",
    addresses: [
      {
        id: "a-demo1",
        label: "Home",
        fullName: "Kai Demo",
        line1: "88 Meridian Row, Sector 7",
        city: "Neo Kyoto",
        region: "Kansai Grid",
        zip: "520-0781",
        country: "Japan",
      },
    ],
    createdAt: Date.now() - 120 * 86_400_000,
    active: true,
  },
];

const seedOrders = (): Order[] => {
  const d = 86_400_000;
  const halo = PRODUCTS[0];
  const pods = PRODUCTS[7];
  const drone = PRODUCTS[2];
  const addr = seedUsers[1].addresses[0];
  return [
    {
      id: "WH-DEMO02",
      userId: "u-demo",
      userEmail: "demo@nova.space",
      items: [{ productId: drone.id, name: drone.name, image: drone.image, color: drone.colors[0].name, qty: 1, price: drone.price }],
      address: addr,
      shippingMethod: "Orbital Express",
      shippingCost: 24,
      discount: 0,
      subtotal: drone.price,
      total: drone.price + 24,
      last4: "4242",
      status: "shipped",
      timeline: [
        { status: "placed", at: Date.now() - 3 * d, note: "Order received — payment authorized" },
        { status: "processing", at: Date.now() - 3 * d + 5 * 3_600_000, note: "Unit passed pre-flight check" },
        { status: "shipped", at: Date.now() - 1 * d, note: "Package handed to orbital carrier" },
      ],
      createdAt: Date.now() - 3 * d,
    },
    {
      id: "WH-DEMO01",
      userId: "u-demo",
      userEmail: "demo@nova.space",
      items: [
        { productId: halo.id, name: halo.name, image: halo.image, color: halo.colors[0].name, qty: 1, price: halo.price },
        { productId: pods.id, name: pods.name, image: pods.image, color: pods.colors[0].name, qty: 1, price: pods.price },
      ],
      address: addr,
      shippingMethod: "Glide Standard",
      shippingCost: 0,
      discount: 55,
      subtotal: halo.price + pods.price,
      total: halo.price + pods.price - 55,
      last4: "4242",
      status: "delivered",
      timeline: [
        { status: "placed", at: Date.now() - 14 * d, note: "Order received — payment authorized" },
        { status: "processing", at: Date.now() - 14 * d + 6 * 3_600_000, note: "Unit passed pre-flight check" },
        { status: "shipped", at: Date.now() - 12 * d, note: "Package handed to orbital carrier" },
        { status: "delivered", at: Date.now() - 9 * d, note: "Confirmed at destination" },
      ],
      createdAt: Date.now() - 14 * d,
    },
  ];
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      theme: "void",
      setTheme: (t) => set({ theme: t }),
      user: null,
      users: seedUsers,
      products: PRODUCTS,
      cart: [],
      wishlist: ["p-halo-x1"],
      orders: seedOrders(),
      reviews: seedReviews(),
      toasts: [],
      cartOpen: false,
      recentlyViewed: [],
      views: Object.fromEntries(PRODUCTS.map((p, i) => [p.id, 340 + p.ratingCount * 9 + i * 53])),
      freeShipThreshold: 150,
      lowStockThreshold: 5,
      promos: [
        { code: "NEON10", pct: 10, active: true },
        { code: "WEARLY25", pct: 25, active: true },
      ],
      restockRequests: [],

      setCartOpen: (v) => set({ cartOpen: v }),
      setFreeShipThreshold: (n) => set({ freeShipThreshold: Math.max(0, n) }),
      setLowStockThreshold: (n) => set({ lowStockThreshold: Math.min(30, Math.max(1, n)) }),

      toast: (kind, title, message) => {
        const id = uid();
        set((s) => ({ toasts: [...s.toasts, { id, kind, title, message }] }));
        setTimeout(() => get().dismissToast(id), 3800);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      login: (email, pass) => {
        const u = get().users.find((x) => x.email.toLowerCase() === email.toLowerCase());
        if (!u) return "No account found for that email.";
        if (!u.active) return "This account has been deactivated.";
        if (u.passHash !== hashPass(pass)) return "Incorrect password. Try again.";
        set({ user: u });
        get().toast("success", `Welcome back, ${u.name.split(" ")[0]}`, "Session linked.");
        return null;
      },
      signup: (name, email, pass) => {
        if (get().users.some((x) => x.email.toLowerCase() === email.toLowerCase()))
          return "An account with that email already exists.";
        const u: User = {
          id: uid(),
          name,
          email,
          passHash: hashPass(pass),
          role: "customer",
          addresses: [],
          createdAt: Date.now(),
          active: true,
        };
        set((s) => ({ users: [...s.users, u], user: u }));
        get().toast("success", "Account created", "Welcome to Wearly House.");
        return null;
      },
      quickLogin: (email) => {
        const u = get().users.find((x) => x.email === email);
        if (u) {
          set({ user: u });
          get().toast("success", `Signed in as ${u.name}`, "Demo session.");
        }
      },
      googleLogin: () => {
        const email = "traveler@gmail.com";
        let u = get().users.find((x) => x.email === email);
        if (!u) {
          u = {
            id: uid(),
            name: "Orbit Traveler",
            email,
            passHash: hashPass(uid()),
            role: "customer",
            addresses: [],
            createdAt: Date.now(),
            active: true,
          };
          set((s) => ({ users: [...s.users, u!] }));
        }
        set({ user: u });
        get().toast("success", "Google session linked", `Signed in as ${u.name}.`);
      },
      logout: () => {
        set({ user: null });
        get().toast("info", "Signed out", "Session terminated.");
      },
      updateProfile: (name, email) => {
        const cur = get().user;
        if (!cur) return;
        const upd = { ...cur, name, email };
        set((s) => ({
          user: upd,
          users: s.users.map((u) => (u.id === cur.id ? upd : u)),
        }));
        get().toast("success", "Profile updated");
      },
      changePassword: (current, next) => {
        const cur = get().user;
        if (!cur) return "Not signed in.";
        if (cur.passHash !== hashPass(current)) return "Current password is incorrect.";
        const upd = { ...cur, passHash: hashPass(next) };
        set((s) => ({ user: upd, users: s.users.map((u) => (u.id === cur.id ? upd : u)) }));
        get().toast("success", "Password changed");
        return null;
      },
      saveAddress: (addr) => {
        const cur = get().user;
        if (!cur) return;
        const withId: Address = { ...addr, id: addr.id ?? uid() };
        const has = cur.addresses.some((a) => a.id === withId.id);
        const addresses = has
          ? cur.addresses.map((a) => (a.id === withId.id ? withId : a))
          : [...cur.addresses, withId];
        const upd = { ...cur, addresses };
        set((s) => ({ user: upd, users: s.users.map((u) => (u.id === cur.id ? upd : u)) }));
        get().toast("success", has ? "Address updated" : "Address added");
      },
      deleteAddress: (id) => {
        const cur = get().user;
        if (!cur) return;
        const upd = { ...cur, addresses: cur.addresses.filter((a) => a.id !== id) };
        set((s) => ({ user: upd, users: s.users.map((u) => (u.id === cur.id ? upd : u)) }));
        get().toast("info", "Address removed");
      },

      addToCart: (productId, color, qty = 1) => {
        const p = get().products.find((x) => x.id === productId);
        if (!p) return;
        const existing = get().cart.find((c) => c.productId === productId && c.color === color);
        if (existing) {
          get().setQty(productId, color, existing.qty + qty);
        } else {
          set((s) => ({ cart: [...s.cart, { productId, color, qty: Math.min(qty, p.stock) }] }));
        }
        get().toast("success", "Added to cart", `${p.name} · ${color}`);
        set({ cartOpen: true });
      },
      setQty: (productId, color, qty) => {
        const p = get().products.find((x) => x.id === productId);
        const max = p?.stock ?? 99;
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((c) => !(c.productId === productId && c.color === color))
              : s.cart.map((c) =>
                  c.productId === productId && c.color === color
                    ? { ...c, qty: Math.min(qty, max) }
                    : c
                ),
        }));
      },
      removeFromCart: (productId, color) =>
        set((s) => ({ cart: s.cart.filter((c) => !(c.productId === productId && c.color === color)) })),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (productId) => {
        const has = get().wishlist.includes(productId);
        set((s) => ({
          wishlist: has ? s.wishlist.filter((id) => id !== productId) : [...s.wishlist, productId],
        }));
        const p = get().products.find((x) => x.id === productId);
        get().toast(has ? "info" : "success", has ? "Removed from wishlist" : "Saved to wishlist", p?.name);
      },
      recordView: (productId) =>
        set((s) => ({
          recentlyViewed: [productId, ...s.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
          views: { ...s.views, [productId]: (s.views[productId] ?? 0) + 1 },
        })),
      reorder: (items) => {
        const products = get().products;
        let added = 0;
        set((s) => {
          const cart = [...s.cart];
          for (const it of items) {
            const p = products.find((x) => x.id === it.productId);
            if (!p || p.stock === 0) continue;
            const ex = cart.find((c) => c.productId === it.productId && c.color === it.color);
            if (ex) ex.qty = Math.min(ex.qty + it.qty, p.stock);
            else cart.push({ productId: it.productId, color: it.color, qty: Math.min(it.qty, p.stock) });
            added++;
          }
          return { cart, cartOpen: added > 0 };
        });
        get().toast(added ? "success" : "info", added ? "Manifest reloaded" : "Nothing to reload", added ? `${added} unit${added > 1 ? "s" : ""} back in cargo.` : "Those units are offline.");
      },

      addPromo: (code, pct) => {
        const c = code.trim().toUpperCase();
        if (!/^[A-Z0-9]{3,12}$/.test(c)) return "Code must be 3–12 letters/digits.";
        if (get().promos.some((p) => p.code === c)) return "That code is already deployed.";
        if (!(pct >= 1 && pct <= 90)) return "Discount must be between 1 and 90%.";
        set((s) => ({ promos: [...s.promos, { code: c, pct, active: true }] }));
        get().toast("success", `Code ${c} deployed`, `-${pct}% at checkout.`);
        return null;
      },
      removePromo: (code) => {
        set((s) => ({ promos: s.promos.filter((p) => p.code !== code) }));
        get().toast("info", `Code ${code} revoked`);
      },
      togglePromo: (code) =>
        set((s) => ({ promos: s.promos.map((p) => (p.code === code ? { ...p, active: !p.active } : p)) })),
      requestRestock: (productId, email) => {
        const e = email.trim().toLowerCase();
        if (get().restockRequests.some((r) => r.productId === productId && r.email === e)) {
          get().toast("info", "Already in the queue", "We'll ping you the moment it lands.");
          return;
        }
        set((s) => ({ restockRequests: [...s.restockRequests, { id: uid(), productId, email: e, at: Date.now() }] }));
        const p = get().products.find((x) => x.id === productId);
        get().toast("success", "Restock ping queued", `We'll signal ${e} when ${p?.name ?? "it"} is back.`);
      },

      placeOrder: ({ address, shippingMethod, shippingCost, discount, last4 }) => {
        const { cart, products, user } = get();
        const items = cart.flatMap((c) => {
          const p = products.find((x) => x.id === c.productId);
          return p ? [{ productId: p.id, name: p.name, image: p.image, color: c.color, qty: c.qty, price: p.price }] : [];
        });
        const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
        const order: Order = {
          id: `WH-${Date.now().toString(36).toUpperCase()}`,
          userId: user?.id ?? "guest",
          userEmail: user?.email ?? "guest",
          items,
          address,
          shippingMethod,
          shippingCost,
          discount,
          subtotal,
          total: Math.max(0, subtotal - discount) + shippingCost,
          last4,
          status: "processing",
          timeline: [{ status: "placed", at: Date.now(), note: "Order received — payment authorized" }],
          createdAt: Date.now(),
        };
        set((s) => ({
          orders: [order, ...s.orders],
          cart: [],
          products: s.products.map((p) => {
            const bought = items.filter((i) => i.productId === p.id).reduce((a, i) => a + i.qty, 0);
            return bought ? { ...p, stock: Math.max(0, p.stock - bought) } : p;
          }),
        }));
        return order;
      },
      setOrderStatus: (orderId, status) => {
        const note =
          status === "processing"
            ? "Back in the queue — repacking unit"
            : status === "shipped"
            ? "Package handed to orbital carrier"
            : status === "delivered"
            ? "Confirmed at destination"
            : "Order cancelled and refunded";
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status, timeline: [...o.timeline, { status, at: Date.now(), note }] }
              : o
          ),
        }));
        get().toast("success", `Order ${orderId}`, `Status → ${status}`);
      },

      upsertProduct: (p) => {
        const exists = get().products.some((x) => x.id === p.id);
        set((s) => ({
          products: exists ? s.products.map((x) => (x.id === p.id ? p : x)) : [p, ...s.products],
        }));
        get().toast("success", exists ? "Product updated" : "Product created", p.name);
      },
      deleteProduct: (id) => {
        const p = get().products.find((x) => x.id === id);
        set((s) => ({
          products: s.products.filter((x) => x.id !== id),
          cart: s.cart.filter((c) => c.productId !== id),
          wishlist: s.wishlist.filter((w) => w !== id),
        }));
        get().toast("info", "Product deleted", p?.name);
      },
      setStock: (id, stock) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, stock } : p)) })),

      addReview: (productId, rating, title, body) => {
        const user = get().user;
        const review: Review = {
          id: uid(),
          productId,
          userName: user?.name ?? "Anonymous",
          rating,
          title,
          body,
          date: Date.now(),
        };
        set((s) => ({ reviews: [review, ...s.reviews] }));
        get().toast("success", "Review published", "Thanks for the signal.");
      },
    }),
    {
      name: "wearly-house-v1",
      partialize: (s) => ({
        theme: s.theme,
        user: s.user,
        users: s.users,
        products: s.products,
        cart: s.cart,
        wishlist: s.wishlist,
        orders: s.orders,
        reviews: s.reviews,
        recentlyViewed: s.recentlyViewed,
        views: s.views,
        freeShipThreshold: s.freeShipThreshold,
        lowStockThreshold: s.lowStockThreshold,
        promos: s.promos,
        restockRequests: s.restockRequests,
      }),
    }
  )
);

/* selectors */
export const cartCount = (cart: CartItem[]) => cart.reduce((a, c) => a + c.qty, 0);
export const cartSubtotal = (cart: CartItem[], products: Product[]) =>
  cart.reduce((a, c) => a + (products.find((p) => p.id === c.productId)?.price ?? 0) * c.qty, 0);
