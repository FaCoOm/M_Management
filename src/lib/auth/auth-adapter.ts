/**
 * Auth adapter interface - abstracts Track A (Supabase Auth) vs Track B (Clerk/Auth0).
 * Sprint 1 scope: Track A only. Track B stub exists but deferred to Sprint 2.
 */

import { createSupabaseAuthAdapter } from "./supabase-auth";

export interface AuthUser {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
}

export interface AuthAdapter {
  /** Sign in with email/password */
  signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }>;

  /** Sign up with email/password */
  signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }>;

  /** Sign out current user */
  signOut(): Promise<{ error: string | null }>;

  /** Get current authenticated user */
  getCurrentUser(): Promise<AuthUser | null>;

  /** Listen to auth state changes */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
}

// Re-export implementations
export { createSupabaseAuthAdapter } from "./supabase-auth";

// Track selector - swap this to switch between auth providers
// TODO: Wire to environment config for Track A vs Track B
export function getAuthAdapter(): AuthAdapter {
  // Track A: Supabase Auth
  return createSupabaseAuthAdapter();
}