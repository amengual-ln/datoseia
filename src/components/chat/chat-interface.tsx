"use client";

import { useState, useRef } from "react";
import { MessageBubble } from "./message-bubble"
import { Badge } from "@/components/ui/badge"
import { materias } from "@/content/materias"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatInterface() {
  const [selectedMateria, setSelectedMateria] = useState<string>("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)
    scrollToBottom()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          materiaSlug: selectedMateria || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error en la solicitud")
      }

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        // AI SDK SSE format: data: {"type":"text-delta","textDelta":"..."}
        const textDeltaMatch = chunk.match(/"textDelta"\s*:\s*"([^"]*)"/)
        if (textDeltaMatch) {
          assistantContent += textDeltaMatch[1]
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantId
                ? { ...msg, content: assistantContent }
                : msg
            )
          )
          continue
        }

        // Plain text chunks (no JSON wrapper)
        if (!chunk.startsWith('data:')) {
          assistantContent += chunk
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantId
                ? { ...msg, content: assistantContent }
                : msg
            )
          )
        }
      }
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="text-sm text-muted-foreground">Filtrar por materia:</label>
        <select
          value={selectedMateria}
          onChange={(e) => setSelectedMateria(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-1.5 text-sm font-mono max-w-[200px]"
        >
          <option value="">Todas</option>
          {materias.map((m) => (
            <option key={m.slug} value={m.slug}>{m.nombre}</option>
          ))}
        </select>
        {isLoading && <Badge variant="tech">Pensando...</Badge>}
      </div>

      <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">Asistente ISFT 199</p>
            <p className="text-sm">
              Preguntá sobre la carrera, cursos, horarios o cualquier contenido institucional.
            </p>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m as any} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
        {error && (
          <div className="text-center py-4">
            <Badge variant="aviso">Error: {error.message}</Badge>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribí tu pregunta..."
          className="flex-1 bg-surface border border-border rounded px-4 py-2 text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-accent text-background font-medium rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Enviar
        </button>
      </form>

      <p className="text-xs text-muted-foreground text-center">
        Las respuestas se generan a partir de documentación subida por el autor. Pueden contener imprecisiones.
      </p>
    </div>
  )
}