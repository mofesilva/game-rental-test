"use client";

import { useEffect, useMemo, useState } from "react";
import { getGamesCollection, getRentalsCollection } from "@/lib/cappuccino/collections";
import type { GameRecord } from "@/lib/types/game";
import type { RentalRecord } from "@/lib/types/rental";

export default function DashboardPage() {
    const gamesCollection = useMemo(() => getGamesCollection(), []);
    const rentalsCollection = useMemo(() => getRentalsCollection(), []);
    const [games, setGames] = useState<GameRecord[]>([]);
    const [rentals, setRentals] = useState<RentalRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            setLoading(true);
            const [gamesSnapshot, rentalsSnapshot] = await Promise.all([
                gamesCollection.find(),
                rentalsCollection.find(),
            ]);
            if (!isMounted) return;
            setGames(gamesSnapshot.documents ?? []);
            setRentals(rentalsSnapshot.documents ?? []);
            setLoading(false);
        }
        void fetchData();
        return () => {
            isMounted = false;
        };
    }, [gamesCollection, rentalsCollection]);

    const gameNames = useMemo(() => {
        const map = new Map<string, string>();
        games.forEach((game) => {
            if (game._id) {
                map.set(game._id, game.title);
            }
        });
        return map;
    }, [games]);

    const activeRentals = rentals.filter((r) => r.status === "active").length;
    const overdueRentals = rentals.filter((r) => r.status === "overdue").length;
    const revenue = rentals.reduce((acc, rental) => acc + (rental.total_amount ?? 0), 0);

    return (
        <section className="space-y-10">
            <div>
                <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                    Visão geral
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Dashboard</h2>
                <p className="text-neutral-400">
                    Acompanhe quantidade de jogos, aluguéis ativos e receita acumulada.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Jogos cadastrados" value={games.length} loading={loading} />
                <StatCard label="Aluguéis ativos" value={activeRentals} loading={loading} />
                <StatCard label="Aluguéis atrasados" value={overdueRentals} loading={loading} />
                <StatCard
                    label="Receita acumulada"
                    value={revenue.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}
                    loading={loading}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                    <h3 className="mb-4 text-lg font-semibold">Últimos jogos</h3>
                    <MiniTable
                        headers={["Título", "Plataforma", "Preço diário"]}
                        rows={(games ?? []).slice(0, 5).map((game) => [
                            game.title,
                            game.platform,
                            formatCurrency(game.daily_price),
                        ])}
                        emptyMessage="Nenhum jogo cadastrado ainda."
                    />
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                    <h3 className="mb-4 text-lg font-semibold">Últimos aluguéis</h3>
                    <MiniTable
                        headers={["Cliente", "Jogo", "Status"]}
                        rows={(rentals ?? []).slice(0, 5).map((rental) => [
                            rental.client_name ?? "Cliente não identificado",
                            rental.game_title ?? gameNames.get(rental.game_id) ?? "Jogo não identificado",
                            rental.status,
                        ])}
                        emptyMessage="Nenhum aluguel encontrado."
                    />
                </div>
            </div>
        </section>
    );
}

function StatCard({
    label,
    value,
    loading,
}: {
    label: string;
    value: number | string;
    loading: boolean;
}) {
    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-neutral-50">
                {loading ? "—" : value}
            </p>
        </div>
    );
}

function MiniTable({
    headers,
    rows,
    emptyMessage,
}: {
    headers: string[];
    rows: Array<Array<string | number>>;
    emptyMessage: string;
}) {
    if (!rows.length) {
        return <p className="text-sm text-neutral-500">{emptyMessage}</p>;
    }
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="text-neutral-500">
                    {headers.map((header) => (
                        <th key={header} className="pb-2 text-left font-normal">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
                {rows.map((row, index) => (
                    <tr key={index} className="text-neutral-200">
                        {row.map((value, cellIndex) => (
                            <td key={`${index}-${cellIndex}`} className="py-2">
                                {value}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function formatCurrency(value: number | undefined) {
    if (!value) return "R$ 0,00";
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}
