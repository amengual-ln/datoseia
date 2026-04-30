import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { mistral } from '@ai-sdk/mistral'
import { streamText } from 'ai'

const MODEL_CHAIN = [
  google('gemini-2.0-flash'),
  groq('llama-3.1-8b-instant'),
  mistral('mistral-small-latest'),
]

export async function withFallback(params: {
  system?: string
  messages?: any[]
  maxTokens?: number
}) {
  let lastError: unknown

  for (const model of MODEL_CHAIN) {
    try {
      return await streamText({ ...params, model } as any)
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