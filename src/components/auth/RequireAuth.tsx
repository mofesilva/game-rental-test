"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@cappuccino/web-sdk";

interface RequireAuthProps {
    children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const router = useRouter();
    const { initializing, user } = useAuth();

    useEffect(() => {
        if (initializing) return;
        if (!user) {
            router.replace("/login");
        }
    }, [initializing, user, router]);

    if (initializing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-300">
                Validando sessão…
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
