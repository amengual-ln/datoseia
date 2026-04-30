import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Chat IA</h1>
        <p className="text-muted-foreground">
          Preguntá sobre la carrera usando el contexto de documentación cargada.
        </p>
      </div>
      <ChatInterface />
    </div>
  )
}