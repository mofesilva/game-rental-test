"use client";
import {
    BrowserTokenStorage,
    type CappuccinoClient,
    createCappuccinoClient,
} from "@cappuccino/web-sdk";

import { resolveCappuccinoConfig } from "./config";

let cachedClient: CappuccinoClient | null = null;

export function getCappuccinoClient(): CappuccinoClient {
    if (!cachedClient) {
        const env = resolveCappuccinoConfig();
        cachedClient = createCappuccinoClient({
            baseUrl: env.baseUrl,
            apiKey: env.apiKey,
            storage: new BrowserTokenStorage({ prefix: "game-rental" }),
        });
    }

    return cachedClient;
}
