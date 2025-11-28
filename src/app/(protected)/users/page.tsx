"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getCappuccinoClient } from "@/lib/cappuccino/client";
import type { DBUser } from "@cappuccino/web-sdk";

export default function UsersPage() {
    const client = useMemo(() => getCappuccinoClient(), []);
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        login: "",
        password: "",
        role_id: "admin",
    });

    useEffect(() => {
        let mounted = true;
        async function fetchUsers() {
            setLoading(true);
            const snapshot = await client.modules.dbusers.find();
            if (!mounted) return;
            if (snapshot.error) {
                setError(snapshot.errorMsg ?? "Erro ao carregar usuários");
            } else {
                setUsers(snapshot.documents ?? []);
                setError(null);
            }
            setLoading(false);
        }
        void fetchUsers();
        return () => {
            mounted = false;
        };
    }, [client]);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const snapshot = await client.modules.dbusers.create({
            ...form,
        });
        if (snapshot.error) {
            setError(snapshot.errorMsg ?? "Não foi possível criar o usuário");
            return;
        }
        setForm({ name: "", email: "", login: "", password: "", role_id: form.role_id });
        if (snapshot.document) {
            setUsers((prev) => [snapshot.document!, ...prev]);
        }
    }

    return (
        <section className="space-y-8">
            <div>
                <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">Equipe</p>
                <h2 className="mt-2 text-3xl font-semibold">Usuários</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-[360px,1fr]">
                <form
                    onSubmit={handleCreate}
                    className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
                >
                    <h3 className="text-lg font-semibold">Cadastrar usuário</h3>
                    <Input
                        label="Nome"
                        value={form.name}
                        onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                        required
                    />
                    <Input
                        label="E-mail"
                        type="email"
                        value={form.email}
                        onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                        required
                    />
                    <Input
                        label="Login"
                        value={form.login}
                        onChange={(value) => setForm((prev) => ({ ...prev, login: value }))}
                        required
                    />
                    <Input
                        label="Senha inicial"
                        type="password"
                        value={form.password}
                        onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                        required
                    />
                    <label className="block text-sm font-medium text-neutral-300">
                        Papel (role)
                        <input
                            value={form.role_id}
                            onChange={(event) => setForm((prev) => ({ ...prev, role_id: event.target.value }))}
                            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-indigo-400 focus:outline-none"
                        />
                    </label>
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400"
                    >
                        Salvar usuário
                    </button>
                </form>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                    <h3 className="mb-4 text-lg font-semibold">Equipe ativa</h3>
                    {error && <p className="text-sm text-red-300">{error}</p>}
                    {loading ? (
                        <p className="text-neutral-400">Carregando…</p>
                    ) : users.length ? (
                        <ul className="space-y-3">
                            {users.map((user) => (
                                <li
                                    key={user._id}
                                    className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4"
                                >
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-neutral-400">{user.email}</p>
                                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                                        {user.role_id}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-neutral-400">Nenhum usuário cadastrado.</p>
                    )}
                </div>
            </div>
        </section>
    );
}

function Input({
    label,
    type = "text",
    value,
    onChange,
    required,
}: {
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}) {
    return (
        <label className="block text-sm font-medium text-neutral-300">
            {label}
            <input
                type={type}
                value={value}
                required={required}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-indigo-400 focus:outline-none"
            />
        </label>
    );
}
