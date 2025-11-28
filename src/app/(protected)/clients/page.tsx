"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getClientsCollection } from "@/lib/cappuccino/collections";
import type { ClientRecord } from "@/lib/types/client";

export default function ClientsPage() {
    const collection = useMemo(() => getClientsCollection(), []);
    const [clients, setClients] = useState<ClientRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        document_id: "",
    });

    useEffect(() => {
        let mounted = true;
        async function fetchClients() {
            setLoading(true);
            const snapshot = await collection.find();
            if (!mounted) return;
            if (snapshot.error) {
                setError(snapshot.errorMsg ?? "Não foi possível carregar os clientes.");
            } else {
                setError(null);
                setClients(snapshot.documents ?? []);
            }
            setLoading(false);
        }
        void fetchClients();
        return () => {
            mounted = false;
        };
    }, [collection]);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        const payload = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            document_id: form.document_id,
            created_at: new Date().toISOString(),
        } satisfies Partial<ClientRecord>;

        const snapshot = await collection.insertOne(payload as ClientRecord);
        if (snapshot.error) {
            setError(snapshot.errorMsg ?? "Não foi possível cadastrar o cliente.");
            return;
        }

        const insertedId = extractInsertedId(snapshot.document);
        const document: ClientRecord = {
            _id: insertedId ?? crypto.randomUUID(),
            ...payload,
            ...(snapshot.document ?? {}),
        } as ClientRecord;

        setClients((prev) => [document, ...prev]);
        setForm({ name: "", email: "", phone: "", document_id: "" });
    }

    return (
        <section className="space-y-8">
            <div>
                <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">Relacionamento</p>
                <h2 className="mt-2 text-3xl font-semibold">Clientes</h2>
                <p className="text-neutral-400">Cadastre contatos que poderão ser vinculados aos aluguéis.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
                <form
                    onSubmit={handleCreate}
                    className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
                >
                    <h3 className="text-lg font-semibold">Novo cliente</h3>
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
                    />
                    <Input
                        label="Telefone"
                        value={form.phone}
                        onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                    />
                    <Input
                        label="Documento"
                        value={form.document_id}
                        onChange={(value) => setForm((prev) => ({ ...prev, document_id: value }))}
                    />
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400"
                    >
                        Salvar cliente
                    </button>
                </form>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Lista</h3>
                        <span className="text-sm text-neutral-400">{clients.length} cadastro(s)</span>
                    </div>
                    <div className="mt-4 space-y-3">
                        {error && <p className="text-sm text-red-300">{error}</p>}
                        {loading ? (
                            <p className="text-neutral-400">Carregando…</p>
                        ) : clients.length ? (
                            clients.map((client) => (
                                <article
                                    key={client._id ?? `${client.name}-${client.email}`}
                                    className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4"
                                >
                                    <h4 className="font-semibold">{client.name}</h4>
                                    <p className="text-sm text-neutral-400">{client.email || "E-mail não informado"}</p>
                                    <p className="text-xs text-neutral-500">
                                        {client.phone || "Telefone não informado"}
                                        {client.document_id ? ` • ${client.document_id}` : ""}
                                    </p>
                                </article>
                            ))
                        ) : (
                            <p className="text-neutral-400">Nenhum cliente cadastrado até o momento.</p>
                        )}
                    </div>
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

function extractInsertedId(document?: unknown): string | undefined {
    if (!document || typeof document !== "object") {
        return undefined;
    }
    const payload = document as { insertedId?: unknown; _id?: unknown };
    if (typeof payload._id === "string") {
        return payload._id;
    }
    if (typeof payload.insertedId === "string") {
        return payload.insertedId;
    }
    return undefined;
}
