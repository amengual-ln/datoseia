"use client";

import { useState } from "react";
import type { Horario } from "@/content/materias";
import { MateriaCard } from "./materia-card";
import { AñoSemestreSelector } from "@/components/materias/año-semestre-selector";

interface SemanaGridProps {
  horarios: Horario[]
  año: 1 | 2 | 3
  semestre: 1 | 2
}

const dias = ["lunes", "martes", "miércoles", "jueves", "viernes"]
const diasHeader: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miércoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
}

function getTodayIndex(): number {
  const day = new Date().getDay()
  if (day === 0) return 4
  if (day === 6) return 4
  return day - 1
}

function horaEnRango(hora: string, inicio: string, fin: string): boolean {
  return hora >= inicio && hora < fin
}

export function SemanaGrid({ horarios, año, semestre }: SemanaGridProps) {
  const [selectedDía, setSelectedDía] = useState<string | null>(null)
  const todayIndex = typeof window !== 'undefined' ? getTodayIndex() : -1

  const horasRange = [16, 17, 18, 19, 20, 21]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AñoSemestreSelector año={año} semestre={semestre} onChange={() => {}} />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 border-b border-border">
          <div className="p-2 bg-surface"></div>
          {dias.map((dia, i) => (
            <div
              key={dia}
              className={`p-2 text-center text-sm font-mono border-l border-border ${
                i === todayIndex ? "bg-accent/10 text-accent" : "bg-surface"
              }`}
            >
              {diasHeader[dia]}
            </div>
          ))}
        </div>

        {horasRange.map((hora) => (
          <div key={hora} className="grid grid-cols-6 border-b border-border last:border-b-0">
            <div className="p-2 text-xs font-mono text-muted-foreground border-r border-border bg-surface">
              {hora}:00
            </div>
            {dias.map((dia, i) => {
              const clase = horarios.find(
                (h) =>
                  h.dia === dia &&
                  horaEnRango(String(hora), h.inicio, h.fin)
              )
              return (
                <div
                  key={dia}
                  className={`min-h-[60px] p-1 border-l border-border ${
                    i === todayIndex ? "bg-accent/5" : ""
                  }`}
                  onClick={() => clase && setSelectedDía(dia === selectedDía ? null : dia)}
                >
                  {clase && (
                    <div className="bg-accent/20 border border-accent/30 rounded p-1 text-xs">
                      <p className="font-medium truncate">{clase.aula || "—"}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  );
}