"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type UserAddress = { id: string; label: string; full: string };
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string; // plain for demo - in prod hash
  wishlist: string[];
  favourites: string[];
  addresses: UserAddress[];
};

type AuthContextType = {
  user: User | null;
  users: User[];
  signup: (data: { name: string; email: string; password: string; phone?: string }) => { ok: boolean; msg?: string };
  login: (email: string, password: string) => { ok: boolean; msg?: string };
  loginWithPhone: (phone: string, password: string) => { ok: boolean; msg?: string };
  logout: () => void;
  toggleWishlist: (id: string) => void;
  toggleFavourite: (id: string) => void;
  addAddress: (addr: Omit<UserAddress, "id">) => void;
  removeAddress: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  isFavourited: (id: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadUsers(): User[] {
  try {
    const s = localStorage.getItem("apna-users");
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}
function saveUsers(users: User[]) {
  try { localStorage.setItem("apna-users", JSON.stringify(users)); } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = loadUsers();
    setUsers(u);
    try {
      const cur = localStorage.getItem("apna-current-user");
      if (cur) {
        const curUser = JSON.parse(cur) as User;
        const found = u.find((x) => x.id === curUser.id);
        if (found) setUser(found);
      }
    } catch {}
  }, []);

  const persist = (nextUsers: User[], cur: User | null) => {
    setUsers(nextUsers);
    saveUsers(nextUsers);
    if (cur) {
      localStorage.setItem("apna-current-user", JSON.stringify(cur));
      setUser(cur);
    } else {
      localStorage.removeItem("apna-current-user");
      setUser(null);
    }
  };

  const signup = ({ name, email, password, phone }: { name: string; email: string; password: string; phone?: string }) => {
    const e = email.toLowerCase().trim();
    if (users.some((u) => u.email.toLowerCase() === e)) return { ok: false, msg: "Email already registered" };
    if (phone) {
      const p = phone.trim().replace(/\D/g, '');
      if (p.length >= 10) {
        if (users.some((u) => u.phone?.replace(/\D/g, '') === p)) return { ok: false, msg: "Phone number already registered" };
      }
    }
    if (password.length < 6) return { ok: false, msg: "Password must be 6+ characters" };
    const newUser: User = { id: Date.now().toString(), name: name.trim(), email: e, password, phone, wishlist: [], favourites: [], addresses: [{ id: "addr1", label: "Home", full: "Eldeco City, Lucknow - Home" }] };
    const next = [...users, newUser];
    persist(next, newUser);
    return { ok: true };
  };

  const login = (email: string, password: string) => {
    const e = email.toLowerCase().trim();
    const found = users.find((u) => u.email.toLowerCase() === e && u.password === password);
    if (!found) return { ok: false, msg: "Invalid email or password" };
    localStorage.setItem("apna-current-user", JSON.stringify(found));
    setUser(found);
    return { ok: true };
  };

  const loginWithPhone = (phone: string, password: string) => {
    const p = phone.trim().replace(/\D/g, '');
    const found = users.find((u) => u.phone?.replace(/\D/g, '') === p && u.password === password);
    if (!found) return { ok: false, msg: "Invalid phone or password" };
    localStorage.setItem("apna-current-user", JSON.stringify(found));
    setUser(found);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem("apna-current-user");
    setUser(null);
  };

  // keep users sync when user mutates
  const updateUser = (updater: (u: User) => User) => {
    if (!user) return;
    const updated = updater(user);
    const next = users.map((u) => (u.id === updated.id ? updated : u));
    persist(next, updated);
  };

  const toggleWishlist = (id: string) => {
    if (!user) {
      // guest fallback to localStorage wishlist
      try {
        const s = localStorage.getItem("apna-wishlist");
        const ids: string[] = s ? JSON.parse(s) : [];
        const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
        localStorage.setItem("apna-wishlist", JSON.stringify(next));
        window.dispatchEvent(new Event("wishlist-guest-update"));
      } catch {}
      return;
    }
    updateUser((u) => ({ ...u, wishlist: u.wishlist.includes(id) ? u.wishlist.filter((x) => x !== id) : [...u.wishlist, id] }));
  };

  const toggleFavourite = (id: string) => {
    if (!user) return toggleWishlist(id);
    updateUser((u) => ({ ...u, favourites: u.favourites.includes(id) ? u.favourites.filter((x) => x !== id) : [...u.favourites, id] }));
  };

  const addAddress = (addr: Omit<UserAddress, "id">) => {
    if (!user) return;
    updateUser((u) => ({ ...u, addresses: [...u.addresses, { ...addr, id: Date.now().toString() }] }));
  };
  const removeAddress = (id: string) => {
    if (!user) return;
    updateUser((u) => ({ ...u, addresses: u.addresses.filter((a) => a.id !== id) }));
  };

  const isWishlisted = (id: string) => (user ? user.wishlist.includes(id) : (() => { try { const s = localStorage.getItem("apna-wishlist"); const ids: string[] = s ? JSON.parse(s) : []; return ids.includes(id); } catch { return false; } })());
  const isFavourited = (id: string) => (user ? user.favourites.includes(id) || user.wishlist.includes(id) : isWishlisted(id));

  // sync external guest wishlist changes
  useEffect(() => {
    const h = () => setUser((prev) => (prev ? { ...prev } : prev));
    window.addEventListener("wishlist-guest-update", h);
    return () => window.removeEventListener("wishlist-guest-update", h);
  }, []);

  return <AuthContext.Provider value={{ user, users, signup, login, loginWithPhone, logout, toggleWishlist, toggleFavourite, addAddress, removeAddress, isWishlisted, isFavourited }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
