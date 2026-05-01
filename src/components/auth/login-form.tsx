/**
 * Login form component - uses auth adapter for authentication.
 */

import { useState } from "react";
import { getAuthAdapter } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuthAdapter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await auth.signIn(email, password);
    setLoading(false);

    if (error) {
      setError(error);
    }
    // On success, auth state change listener in App will redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--harbor-background]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>M_Management</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Track B adapter stub - implement Clerk/Auth0 in Sprint 2
/*
export function createClerkAuthAdapter(): AuthAdapter {
  // TODO: Sprint 2 - integrate Clerk or Auth0
  throw new Error("Track B auth not yet implemented");
}
*/