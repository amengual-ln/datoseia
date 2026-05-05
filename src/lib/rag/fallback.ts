import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { mistral } from '@ai-sdk/mistral'
import { streamText } from 'ai'

const MODEL_CHAIN = [
  groq('llama-3.3-70b-versatile'),
  groq('llama-3.1-8b-instant'),
  mistral('mistral-small-latest'),
  google('gemini-2.0-flash'),
]

export async function withFallback(params: {
  system?: string
  messages?: any[]
  maxTokens?: number
}) {
  let lastError: unknown

  for (const model of MODEL_CHAIN) {
    try {
      const result = await streamText({ ...params, model } as any)
      return result
    } catch (err: any) {
      const isQuotaError =
        err?.status === 429 ||
        err?.code === 'rate_limit_exceeded' ||
        err?.message?.includes('quota')

      if (isQuotaError) {
        lastError = err
        continue
      }
      throw err
    }
  }

  throw lastError
}