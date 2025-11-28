"use client";

import { useMemo, type ComponentProps } from "react";
import { CappuccinoProvider } from "@cappuccino/web-sdk";

import { getCappuccinoClient } from "@/lib/cappuccino/client";

type ProviderChildren = ComponentProps<typeof CappuccinoProvider>["children"];

interface AppProvidersProps {
    children: ProviderChildren;
}

export function AppProviders({ children }: AppProvidersProps) {
    const client = useMemo(() => getCappuccinoClient(), []);

    return (
        <CappuccinoProvider
            apiClient={client.apiClient}
            authManager={client.authManager}
        >
            {children}
        </CappuccinoProvider>
    );
}
