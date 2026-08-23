"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getIdentity, getRole } from "@/lib/services";
import type { Identity, Role } from "@/lib/types";

interface AuthState {
  user: User | null;
  identity: Identity | null;
  role: Role;
  loading: boolean;
  refreshIdentity: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  identity: null,
  role: "user",
  loading: true,
  refreshIdentity: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [role, setRole] = useState<Role>("user");
  const [loading, setLoading] = useState(true);

  async function loadProfile(u: User) {
    const userRef = doc(db, "users", u.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: u.email ?? "",
        displayName: u.displayName ?? "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    const [id, r] = await Promise.all([getIdentity(u.uid), getRole(u.uid)]);
    setIdentity(id);
    setRole(r);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await loadProfile(u);
        } catch (err) {
          console.error("Failed to load profile", err);
        }
      } else {
        setIdentity(null);
        setRole("user");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshIdentity = async () => {
    if (user) {
      setIdentity(await getIdentity(user.uid));
    }
  };

  return (
    <AuthContext.Provider value={{ user, identity, role, loading, refreshIdentity }}>
      {children}
    </AuthContext.Provider>
  );
}
