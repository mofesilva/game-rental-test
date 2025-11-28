import type { ComponentProps, ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cappuccino Game Rental",
  description:
    "Sistema de locadora para cadastro de usuários, catálogo de jogos e controle de aluguéis",
};

type ProviderChildren = ComponentProps<typeof AppProviders>["children"];

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const providerChildren = children as ProviderChildren;

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{providerChildren}</AppProviders>
      </body>
    </html>
  );
}
