"use client";

import { useState } from "react";

interface AñoSemestreSelectorProps {
  año: 1 | 2 | 3
  semestre: 1 | 2
  onChange: (año: 1 | 2 | 3, semestre: 1 | 2) => void
}

const años: (1 | 2 | 3)[] = [1, 2, 3]
const semestres: (1 | 2)[] = [1, 2]

export function AñoSemestreSelector({ año, semestre, onChange }: AñoSemestreSelectorProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-muted-foreground">Año</label>
        <div className="flex gap-1">
          {años.map((a) => (
            <button
              key={a}
              onClick={() => onChange(a, semestre)}
              className={`px-3 py-1.5 text-sm font-mono rounded border transition-colors ${
                año === a
                  ? "bg-accent text-background border-accent"
                  : "bg-surface border-border hover:border-accent"
              }`}
            >
              {a}º
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-muted-foreground">Semestre</label>
        <div className="flex gap-1">
          {semestres.map((s) => (
            <button
              key={s}
              onClick={() => onChange(año, s)}
              className={`px-3 py-1.5 text-sm font-mono rounded border transition-colors ${
                semestre === s
                  ? "bg-accent text-background border-accent"
                  : "bg-surface border-border hover:border-accent"
              }`}
            >
              {s}º
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}