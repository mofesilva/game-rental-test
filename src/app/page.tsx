'use client';

import { useEffect } from "react";
import { useAuth } from "@cappuccino/web-sdk";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [initializing, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">
          Cappuccino Game Rental
        </p>
        <h1 className="text-3xl font-semibold">Carregando ambiente seguro…</h1>
        <p className="text-neutral-400">Verificando sessão e redirecionando automaticamente.</p>
      </div>
    </div>
  );
}
