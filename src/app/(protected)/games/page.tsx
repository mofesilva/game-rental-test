"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getGamesCollection } from "@/lib/cappuccino/collections";
import type { GameRecord } from "@/lib/types/game";

export default function GamesPage() {
    const collection = useMemo(() => getGamesCollection(), []);
    const [games, setGames] = useState<GameRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: "",
        platform: "",
        daily_price: "",
        stock: "",
    });

    useEffect(() => {
        let mounted = true;
        async function fetchGames() {
            setLoading(true);
            const snapshot = await collection.find();
            if (!mounted) return;
            if (snapshot.error) {
                setError(snapshot.errorMsg ?? "Falha ao listar jogos");
            } else {
                setError(null);
                setGames(snapshot.documents ?? []);
            }
            setLoading(false);
        }
        void fetchGames();
        return () => {
            mounted = false;
        };
    }, [collection]);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const payload = {
            title: form.title,
            platform: form.platform,
            daily_price: Number(form.daily_price),
            stock: Number(form.stock),
            created_at: new Date().toISOString(),
        } satisfies Partial<GameRecord>;

        const snapshot = await collection.insertOne(payload as GameRecord);
        if (snapshot.error) {
            setError(snapshot.errorMsg ?? "Não foi possível criar o jogo");
            return;
        }
        const insertedId = extractInsertedId(snapshot.document);
        const newRecord: GameRecord = {
            _id: insertedId ?? crypto.randomUUID(),
            ...payload,
        } as GameRecord;
        if (snapshot.document && "title" in snapshot.document) {
            Object.assign(newRecord, snapshot.document);
        }
        setGames((prev) => [newRecord, ...prev]);
        setForm({ title: "", platform: "", daily_price: "", stock: "" });
    }

    return (
        <section className="space-y-8">
            <div>
                <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">Catálogo</p>
                <h2 className="mt-2 text-3xl font-semibold">Jogos</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-[320px,1fr]">
                <form
                    onSubmit={handleCreate}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4"
                >
                    <h3 className="text-lg font-semibold">Cadastrar jogo</h3>
                    <Input
                        label="Título"
                        value={form.title}
                        onChange={(value) => setForm((prev) => ({ ...prev, title: value }))}
                        required
                    />
                    <Input
                        label="Plataforma"
                        value={form.platform}
                        onChange={(value) => setForm((prev) => ({ ...prev, platform: value }))}
                        required
                    />
                    <Input
                        label="Preço diário (R$)"
                        type="number"
                        step="0.01"
                        value={form.daily_price}
                        onChange={(value) => setForm((prev) => ({ ...prev, daily_price: value }))}
                        required
                    />
                    <Input
                        label="Estoque"
                        type="number"
                        value={form.stock}
                        onChange={(value) => setForm((prev) => ({ ...prev, stock: value }))}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400"
                    >
                        Salvar
                    </button>
                </form>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                    <h3 className="mb-4 text-lg font-semibold">Jogos cadastrados</h3>
                    {error && <p className="text-sm text-red-300">{error}</p>}
                    {loading ? (
                        <p className="text-neutral-400">Carregando…</p>
                    ) : games.length ? (
                        <div className="space-y-3">
                            {games.map((game, index) => (
                                <article
                                    key={game._id ?? `${game.title}-${index}`}
                                    className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold">{game.title}</h4>
                                            <p className="text-sm text-neutral-400">{game.platform}</p>
                                        </div>
                                        <div className="text-right text-sm text-neutral-300">
                                            <p>{formatCurrency(game.daily_price)}</p>
                                            <p className="text-neutral-500">{game.stock} em estoque</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-400">Nenhum jogo cadastrado.</p>
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
    step,
    required,
}: {
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    step?: string;
    required?: boolean;
}) {
    return (
        <label className="block text-sm font-medium text-neutral-300">
            {label}
            <input
                type={type}
                value={value}
                required={required}
                step={step}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-indigo-400 focus:outline-none"
            />
        </label>
    );
}

function formatCurrency(value?: number) {
    if (typeof value !== "number") return "R$ 0,00";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function extractInsertedId(document?: unknown): string | undefined {
    if (!document || typeof document !== "object") {
        return undefined;
    }
    const record = document as { insertedId?: unknown; _id?: unknown };
    if (typeof record._id === "string") {
        return record._id;
    }
    if (typeof record.insertedId === "string") {
        return record.insertedId;
    }
    return undefined;
}
