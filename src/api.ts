/**
 * Обращения к серверу комнат.
 *
 * Сервер видит только хеши и шифротекст — ни идентификатор комнаты, ни ключ
 * владельца, ни содержимое сюда не попадают в открытом виде.
 */

import { sha256 } from './crypto.js'

const BASE = (process.env.ROOM_SERVER ?? 'https://services.tscodex.com').replace(/\/$/, '')

/** Чуть больше серверного потолка ожидания (55 с), иначе рвём собственный запрос. */
const WAIT_TIMEOUT_MS = 70_000
const NORMAL_TIMEOUT_MS = 15_000

export interface RemoteMessage {
  seq: number
  sender: string
  content: string
  nonce: string
  createdAt: string
}

async function call<T>(path: string, init: RequestInit, timeoutMs: number): Promise<T> {
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), timeoutMs)

  try {
    const res = await fetch(`${BASE}/api/v1/rooms${path}`, {
      ...init,
      signal: abort.signal,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })

    const body = (await res.json().catch(() => ({}))) as { error?: string } & T
    if (!res.ok) throw new Error(body.error ?? `Server returned ${res.status}`)
    return body
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Server did not respond within ${Math.round(timeoutMs / 1000)}s`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export function createRoom(roomId: string, ownerKey: string, ttlDays?: number) {
  return call<{ expiresAt: string }>(
    '',
    {
      method: 'POST',
      body: JSON.stringify({ idHash: sha256(roomId), ownerKeyHash: sha256(ownerKey), ttlDays }),
    },
    NORMAL_TIMEOUT_MS,
  )
}

export function sendMessage(roomId: string, sender: string, content: string, nonce: string) {
  return call<{ seq: number }>(
    '/messages',
    { method: 'POST', body: JSON.stringify({ idHash: sha256(roomId), sender, content, nonce }) },
    NORMAL_TIMEOUT_MS,
  )
}

export function fetchMessages(roomId: string, since: number) {
  return call<{ messages: RemoteMessage[] }>(
    `/messages?idHash=${sha256(roomId)}&since=${since}`,
    { method: 'GET' },
    NORMAL_TIMEOUT_MS,
  )
}

export function waitForMessages(roomId: string, since: number) {
  return call<{ messages: RemoteMessage[]; timedOut?: boolean }>(
    `/wait?idHash=${sha256(roomId)}&since=${since}`,
    { method: 'GET' },
    WAIT_TIMEOUT_MS,
  )
}

export function deleteRoom(roomId: string) {
  return call<{ ok: true }>(
    '',
    { method: 'DELETE', body: JSON.stringify({ idHash: sha256(roomId) }) },
    NORMAL_TIMEOUT_MS,
  )
}

export function fetchMembers(roomId: string) {
  return call<{ members: { sender: string; messages: number; lastAt: string }[] }>(
    `/members?idHash=${sha256(roomId)}`,
    { method: 'GET' },
    NORMAL_TIMEOUT_MS,
  )
}

export function createInvite(code: string, payload: string, nonce: string) {
  return call<{ expiresAt: string }>(
    '/invites',
    { method: 'POST', body: JSON.stringify({ codeHash: sha256(code), payload, nonce }) },
    NORMAL_TIMEOUT_MS,
  )
}

export function redeemInvite(code: string) {
  return call<{ payload: string; nonce: string }>(
    '/invites/redeem',
    { method: 'POST', body: JSON.stringify({ codeHash: sha256(code) }) },
    NORMAL_TIMEOUT_MS,
  )
}
