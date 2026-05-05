import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "datoseia | ISFT 199",
  description: "Portal del Técnico Superior en Data Science e Inteligencia Artificial — ISFT 199",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
                  <span className="text-white font-serif font-bold text-lg">D</span>
                </div>
                <div>
                  <span className="font-serif font-semibold text-lg tracking-tight">datoseia</span>
                  <span className="hidden sm:inline text-muted text-sm ml-2">ISFT 199</span>
                </div>
              </div>
              <nav className="flex items-center gap-1">
                {[
                  { href: "/", label: "Inicio" },
                  { href: "/calendario", label: "Calendario" },
                  { href: "/materias", label: "Materias" },
                  { href: "/novedades", label: "Novedades" },
                  { href: "/recursos", label: "Recursos" },
                  { href: "/resumenes", label: "Resumenes" },
                  { href: "/chat", label: "Chat IA" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 text-sm font-sans font-medium rounded-md hover:bg-surface-raised hover:text-accent transition-all duration-150 text-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">{children}</main>

        <footer className="border-t border-border bg-surface-raised mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="font-serif font-semibold text-lg">ISFT 199</p>
                <p className="text-sm text-muted">Tecnico Superior en Data Science e Inteligencia Artificial</p>
              </div>
              <div className="flex gap-6 text-sm text-muted">
                <a href="/calendario" className="hover:text-accent transition-colors">Calendario</a>
                <a href="/materias" className="hover:text-accent transition-colors">Materias</a>
                <a href="/chat" className="hover:text-accent transition-colors">Chat IA</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}