import { kv } from '@vercel/kv'

const WINDOW_SECONDS = 60
const MAX_REQUESTS = 5

export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean
  remaining: number
  resetIn: number
}> {
  const key = `rl:chat:${ip}`

  const count = await kv.incr(key)
  if (count === 1) {
    await kv.expire(key, WINDOW_SECONDS)
  }
  const ttl = await kv.ttl(key)

  return {
    allowed: count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
    resetIn: ttl,
  }
}