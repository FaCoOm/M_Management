/**
 * Track A: Supabase Auth implementation of auth adapter.
 */

import { supabase } from "@/lib/supabase";
import type { AuthAdapter, AuthUser } from "./auth-adapter";

export function createSupabaseAuthAdapter(): AuthAdapter {
  return {
    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error: error.message };
      const user = data.user ? mapToAuthUser(data.user) : null;
      return { user, error: null };
    },

    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { user: null, error: error.message };
      const user = data.user ? mapToAuthUser(data.user) : null;
      return { user, error: null };
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message ?? null };
    },

    async getCurrentUser() {
      const { data } = await supabase.auth.getUser();
      return data.user ? mapToAuthUser(data.user) : null;
    },

    onAuthStateChange(callback) {
      const { data } = supabase.auth.onAuthStateChange((_, session) => {
        callback(session?.user ? mapToAuthUser(session.user) : null);
      });
      return () => data.subscription.unsubscribe();
    },
  };
}

function mapToAuthUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? null,
    user_metadata: supabaseUser.user_metadata,
  };
}