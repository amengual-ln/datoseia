import { NextRequest, NextResponse } from 'next/server'
import { ragSync } from '@/lib/rag/sync'

export const runtime = 'nodejs'

interface ChatwootMessage {
  id: number
  content: string
  message_type: string
  created_at: string
}

interface ChatwootPayload {
  event: string
  conversation_id: number
  message: ChatwootMessage
}

async function sendChatwootMessage(conversationId: number, content: string): Promise<void> {
  const response = await fetch(
    `${process.env.CHATWOOT_API_URL}/api/v1/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': process.env.CHATWOOT_BOT_TOKEN!,
      },
      body: JSON.stringify({
        content,
        message_type: 'outgoing',
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('Chatwoot API error:', response.status, error)
    throw new Error(`Chatwoot API failed: ${response.status}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x:chatwoot-signature')
    if (secret !== process.env.CHATWOOT_WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const payload: ChatwootPayload = await req.json()

    if (payload.event !== 'message_created') {
      return new NextResponse('OK', { status: 200 })
    }

    const { message, conversation_id } = payload

    if (message.message_type !== 'incoming') {
      return new NextResponse('OK', { status: 200 })
    }

    const ragResponse = await ragSync({
      messages: [{ role: 'user', content: message.content }],
    })

    await sendChatwootMessage(conversation_id, ragResponse)

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Chatwoot webhook error:', error)

    try {
      const payload: ChatwootPayload = await req.json()
      if (payload.conversation_id && payload.message) {
        await sendChatwootMessage(
          payload.conversation_id,
          'Error al procesar tu mensaje. Intentá de nuevo.'
        )
      }
    } catch {}

    return new NextResponse('Error', { status: 500 })
  }
}