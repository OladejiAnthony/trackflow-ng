"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Session, User, UserMetadata } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
} from "@/lib/supabase/auth";

// ─── Auth Store ───────────────────────────────────────────────────────────────
// In-memory only — auth tokens must never be persisted to localStorage.

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
}));

// ─── Subscription singleton ───────────────────────────────────────────────────
// Prevents duplicate onAuthStateChange listeners when multiple components
// call useAuth() simultaneously.

let subscriptionSetUp = false;

// ─── useAuth ──────────────────────────────────────────────────────────────────

export function useAuth() {
  const { user, session, loading, setUser, setSession, setLoading, setInitialized } =
    useAuthStore();

  useEffect(() => {
    if (subscriptionSetUp) return;
    subscriptionSetUp = true;

    const supabase = createClient();

    // Initial session check — faster than waiting for the auth state event
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setInitialized(true);
    });

    // Listen for SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, etc.
    // This is the primary mechanism for auto-refreshing the session.
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // The subscription lives for the app's lifetime — no cleanup needed.
  }, [setUser, setSession, setLoading, setInitialized]);

  // ── Action wrappers ──────────────────────────────────────────────────────────

  async function signIn(email: string, password: string) {
    setLoading(true);
    const result = await authSignIn(email, password);
    // Store update happens via onAuthStateChange; just return result for callers
    if (result.error) setLoading(false);
    return result;
  }

  async function signOut() {
    setLoading(true);
    const result = await authSignOut();
    if (result.error) setLoading(false);
    return result;
  }

  async function signUp(
    email: string,
    password: string,
    metadata?: UserMetadata
  ) {
    setLoading(true);
    const result = await authSignUp(email, password, metadata);
    if (result.error) setLoading(false);
    return result;
  }

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
  };
}
