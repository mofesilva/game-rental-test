"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useAuth } from "@cappuccino/web-sdk";

import { getCappuccinoClient } from "@/lib/cappuccino/client";

const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/games", label: "Jogos" },
    { href: "/clients", label: "Clientes" },
    { href: "/rentals", label: "Aluguéis" },
    { href: "/users", label: "Usuários" },
];

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const client = getCappuccinoClient();

    async function handleLogout() {
        if (!user) return;
        await client.modules.dbusers.signOut(user._id);
        router.replace("/login");
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Cappuccino</p>
                        <h1 className="text-lg font-semibold">Game Rental Console</h1>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-neutral-400">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-full px-3 py-1 font-medium transition ${pathname === item.href
                                    ? "bg-neutral-100 text-neutral-900"
                                    : "hover:text-neutral-200"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-full border border-neutral-700 px-3 py-1 text-neutral-300 hover:border-red-500 hover:text-red-400"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
    );
}
