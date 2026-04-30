import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "datoseia | ISFT 199",
  description: "Portal del Técnico Superior en Data Science e Inteligencia Artificial - ISFT 199",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">{children}</main>
        <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
          <p>ISFT 199 — Técnico Superior en Data Science e Inteligencia Artificial</p>
        </footer>
      </body>
    </html>
  );
}