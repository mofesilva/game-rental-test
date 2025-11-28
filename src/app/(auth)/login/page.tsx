"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@cappuccino/web-sdk";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, user, initializing } = useAuth();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initializing) return;
        if (user) {
            router.replace("/dashboard");
        }
    }, [initializing, user, router]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await signIn({ login, password });
            if (result.error) {
                throw new Error(result.errorMsg ?? "Falha no login. Verifique suas credenciais.");
            }
            router.replace("/dashboard");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha inesperada ao tentar entrar.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-neutral-50">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-2xl">
                <header className="mb-8 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                        Cappuccino
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">Painel da Locadora</h1>
                    <p className="text-sm text-neutral-400">Entre com seu usuário do Cappuccino.</p>
                </header>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-neutral-300">
                        Usuário
                        <input
                            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-base text-neutral-100 focus:border-indigo-400 focus:outline-none"
                            value={login}
                            onChange={(event) => setLogin(event.target.value)}
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className="block text-sm font-medium text-neutral-300">
                        Senha ou OTP
                        <input
                            type="password"
                            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-base text-neutral-100 focus:border-indigo-400 focus:outline-none"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    {error && (
                        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || initializing || Boolean(user)}
                        className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Entrando…" : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
