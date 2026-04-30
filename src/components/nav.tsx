import Link from "next/link";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/calendario", label: "Calendario" },
  { href: "/materias", label: "Materias" },
  { href: "/novedades", label: "Novedades" },
  { href: "/recursos", label: "Recursos" },
  { href: "/resumenes", label: "Resúmenes" },
  { href: "/chat", label: "Chat IA" },
];

export function Nav() {
  return (
    <nav className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-mono text-accent font-bold text-lg">
            datoseia
          </Link>
          <div className="flex gap-1 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm rounded-md hover:bg-surface hover:text-accent transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}