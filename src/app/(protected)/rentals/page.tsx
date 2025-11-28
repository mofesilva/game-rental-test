"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getClientsCollection, getGamesCollection, getRentalsCollection } from "@/lib/cappuccino/collections";
import type { ClientRecord } from "@/lib/types/client";
import type { GameRecord } from "@/lib/types/game";
import type { RentalRecord } from "@/lib/types/rental";

export default function RentalsPage() {
    const rentalsCollection = useMemo(() => getRentalsCollection(), []);
    const gamesCollection = useMemo(() => getGamesCollection(), []);
    const clientsCollection = useMemo(() => getClientsCollection(), []);
    const [rentals, setRentals] = useState<RentalRecord[]>([]);
    const [games, setGames] = useState<GameRecord[]>([]);
    const [clients, setClients] = useState<ClientRecord[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        game_id: "",
        start_date: "",
        end_date: "",
    });

    useEffect(() => {
        let mounted = true;
        async function bootstrap() {
            setLoading(true);
            const [rentalsSnapshot, gamesSnapshot, clientsSnapshot] = await Promise.all([
                rentalsCollection.find(),
                gamesCollection.find(),
                clientsCollection.find(),
            ]);
            if (!mounted) return;
            if (rentalsSnapshot.error) {
                setError(rentalsSnapshot.errorMsg ?? "Erro ao carregar aluguéis");
            } else {
                setRentals(rentalsSnapshot.documents ?? []);
            }
            if (!gamesSnapshot.error) {
                setGames(gamesSnapshot.documents ?? []);
            }
            if (!clientsSnapshot.error) {
                const docs = clientsSnapshot.documents ?? [];
                setClients(docs);
                setSelectedClientId((prev) => prev || docs[0]?._id || "");
            }
            setLoading(false);
        }
        void bootstrap();
        return () => {
            mounted = false;
        };
    }, [rentalsCollection, gamesCollection, clientsCollection]);

    const selectedClient = clients.find((client) => client._id === selectedClientId);
    const gameNames = useMemo(() => {
        const map = new Map<string, string>();
        games.forEach((game) => {
            if (game._id) {
                map.set(game._id, game.title);
            }
        });
        return map;
    }, [games]);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedClient) {
            setError("Selecione um cliente antes de registrar o aluguel.");
            return;
        }
        const selectedGame = games.find((game) => game._id === form.game_id);
        const start = new Date(form.start_date);
        const end = new Date(form.end_date);
        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
        const dailyPrice = selectedGame?.daily_price ?? 0;
        const totalAmount = totalDays * dailyPrice;
        const gameTitle = selectedGame?.title ?? "Jogo não identificado";

        const payload = {
            client_id: selectedClient._id,
            client_name: selectedClient.name,
            game_id: form.game_id,
            game_title: gameTitle,
            start_date: form.start_date,
            end_date: form.end_date,
            status: "active",
            daily_price: dailyPrice,
            total_days: totalDays,
            total_amount: totalAmount,
            created_at: new Date().toISOString(),
        } satisfies Partial<RentalRecord>;

        const snapshot = await rentalsCollection.insertOne(payload as RentalRecord);
        if (snapshot.error) {
            setError(snapshot.errorMsg ?? "Não foi possível criar o aluguel");
            return;
        }
        const rentalRecord = buildRentalRecord(snapshot.document, payload);
        setRentals((prev) => [rentalRecord, ...prev]);
        setForm({ game_id: "", start_date: "", end_date: "" });
    }

    async function markReturned(rental: RentalRecord) {
        const snapshot = await rentalsCollection.updateOne(rental._id, {
            status: "returned",
            returned_at: new Date().toISOString(),
        } as Partial<RentalRecord>);
        if (snapshot.error) {
            setError(snapshot.errorMsg ?? "Erro ao finalizar aluguel");
            return;
        }
        setRentals((prev) =>
            prev.map((item) => (item._id === rental._id ? { ...item, status: "returned" } : item))
        );
    }

    return (
        <section className="space-y-8">
            <div>
                <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">Fluxo</p>
                <h2 className="mt-2 text-3xl font-semibold">Aluguéis</h2>
            </div>

            <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
                <aside className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold">Clientes</h3>
                        <Link
                            href="/clients"
                            className="text-sm font-medium text-indigo-300 hover:text-indigo-100"
                        >
                            Gerenciar
                        </Link>
                    </div>
                    {clients.length ? (
                        <div className="space-y-2">
                            {clients.map((client) => {
                                const isActive = client._id === selectedClientId;
                                return (
                                    <button
                                        key={client._id ?? `${client.name}-${client.email}`}
                                        type="button"
                                        onClick={() => setSelectedClientId(client._id)}
                                        className={`w-full rounded-xl border px-4 py-3 text-left transition ${isActive
                                                ? "border-indigo-400/60 bg-indigo-500/10"
                                                : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700"
                                            }`}
                                    >
                                        <p className="font-semibold">{client.name}</p>
                                        <p className="text-sm text-neutral-400">{client.email || client.phone || "Sem contato"}</p>
                                        {client.document_id && (
                                            <p className="text-xs text-neutral-500">{client.document_id}</p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400">
                            Nenhum cliente cadastrado. Use o botão acima para criar os primeiros registros.
                        </p>
                    )}
                </aside>

                <div className="space-y-6">
                    <form
                        onSubmit={handleCreate}
                        className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
                    >
                        <h3 className="text-lg font-semibold">Novo aluguel</h3>
                        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 text-sm text-neutral-300">
                            <p className="font-semibold text-neutral-100">Cliente selecionado</p>
                            {selectedClient ? (
                                <div className="mt-2 space-y-1 text-neutral-400">
                                    <p>{selectedClient.name}</p>
                                    <p>{selectedClient.email || selectedClient.phone || "Sem contato"}</p>
                                    {selectedClient.document_id && (
                                        <p className="text-xs text-neutral-500">{selectedClient.document_id}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-2 text-neutral-500">Selecione um cliente na coluna ao lado.</p>
                            )}
                        </div>
                        <label className="block text-sm font-medium text-neutral-300">
                            Jogo
                            <select
                                required
                                value={form.game_id}
                                onChange={(event) => setForm((prev) => ({ ...prev, game_id: event.target.value }))}
                                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-indigo-400 focus:outline-none"
                            >
                                <option value="">Selecione…</option>
                                {games.map((game) => (
                                    <option key={game._id} value={game._id}>
                                        {game.title}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <Input
                            label="Início"
                            type="date"
                            value={form.start_date}
                            onChange={(value) => setForm((prev) => ({ ...prev, start_date: value }))}
                            required
                        />
                        <Input
                            label="Devolução"
                            type="date"
                            value={form.end_date}
                            onChange={(value) => setForm((prev) => ({ ...prev, end_date: value }))}
                            required
                        />
                        <button
                            type="submit"
                            disabled={!selectedClient}
                            className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Registrar aluguel
                        </button>
                    </form>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                        <h3 className="mb-4 text-lg font-semibold">Registros</h3>
                        {error && <p className="text-sm text-red-300">{error}</p>}
                        {loading ? (
                            <p className="text-neutral-400">Carregando…</p>
                        ) : rentals.length ? (
                            <div className="space-y-3">
                                {rentals.map((rental) => (
                                    <article
                                        key={rental._id ?? rental.client_id}
                                        className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-neutral-400">{rental.client_name ?? "Cliente não identificado"}</p>
                                                <h4 className="font-semibold">{rental.game_title ?? gameNames.get(rental.game_id) ?? "Jogo não identificado"}</h4>
                                                <p className="text-xs text-neutral-500">
                                                    {formatDate(rental.start_date)} • {formatDate(rental.end_date)}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm text-neutral-300">
                                                <p className="font-semibold">{formatCurrency(rental.total_amount)}</p>
                                                <p className="uppercase tracking-widest text-xs text-neutral-500">
                                                    {rental.status}
                                                </p>
                                                {rental.status === "active" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markReturned(rental)}
                                                        className="mt-2 rounded-full border border-green-500/60 px-3 py-1 text-xs text-green-400"
                                                    >
                                                        Marcar devolvido
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="text-neutral-400">Nenhum aluguel encontrado.</p>
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

function formatCurrency(value?: number) {
    if (typeof value !== "number") return "R$ 0,00";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value?: string) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("pt-BR");
}

function buildRentalRecord(snapshot?: unknown, fallback?: Partial<RentalRecord>): RentalRecord {
    const insertedId = extractInsertedId(snapshot);
    if (snapshot && typeof snapshot === "object" && "_id" in (snapshot as Record<string, unknown>)) {
        return snapshot as RentalRecord;
    }
    return {
        _id: insertedId ?? crypto.randomUUID(),
        status: "active",
        daily_price: 0,
        total_amount: 0,
        total_days: 0,
        game_title: "Jogo não identificado",
        ...fallback,
    } as RentalRecord;
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
