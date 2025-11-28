import { Collection } from "@cappuccino/web-sdk";

import { getCappuccinoClient } from "./client";
import type { ClientRecord } from "@/lib/types/client";
import type { GameRecord } from "@/lib/types/game";
import type { RentalRecord } from "@/lib/types/rental";

export function getGamesCollection() {
    const client = getCappuccinoClient();
    return new Collection<GameRecord>({ apiClient: client.apiClient, name: "games" });
}

export function getRentalsCollection() {
    const client = getCappuccinoClient();
    return new Collection<RentalRecord>({ apiClient: client.apiClient, name: "rentals" });
}

export function getClientsCollection() {
    const client = getCappuccinoClient();
    return new Collection<ClientRecord>({ apiClient: client.apiClient, name: "clients" });
}

export function getRentalEventsCollection() {
    const client = getCappuccinoClient();
    return new Collection<Record<string, unknown>>({ apiClient: client.apiClient, name: "rental_events" });
}
