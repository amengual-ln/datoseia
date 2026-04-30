interface BadgeProps {
  variant?: "default" | "tech" | "aviso" | "institucional"
  children: React.ReactNode
}

const variantClasses = {
  default: "bg-surface text-foreground border-border",
  tech: "bg-accent/10 text-accent border-accent/30",
  aviso: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  institucional: "bg-blue-500/10 text-blue-400 border-blue-500/30",
}

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono border rounded ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}