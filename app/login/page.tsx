import { Volleyball } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Volleyball className="size-6 text-primary" />
          </div>
          <CardTitle className="text-xl">My Padel Manager</CardTitle>
          <CardDescription>Introduce tus credenciales para entrar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/login" method="post" className="space-y-4">
            <input type="hidden" name="from" value={from ?? "/"} />

            <div className="space-y-1.5">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive">
                Usuario o contraseña incorrectos.
              </p>
            ) : null}

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
