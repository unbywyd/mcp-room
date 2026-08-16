/**
 * Что мы помним между запусками.
 *
 * Идентификатор комнаты и ключ владельца лежат на диске, потому что иначе
 * человеку пришлось бы вводить их в каждом новом чате — а смысл именно в том,
 * чтобы новый чат подхватывал беседу сам.
 *
 * Файл кладём с правами 600: это секреты, и по идентификатору читается вся
 * переписка.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'

export interface RoomState {
  roomId: string
  /** Есть только у того, кто комнату завёл: право удалить не передаётся вместе с id. */
  ownerKey?: string
  /** Номер последнего прочитанного сообщения — чтобы читать только новое. */
  lastSeq: number
  /** Как называть себя в беседе. */
  sender: string
}

const FILE = join(homedir(), '.tscodex', 'room.json')

export function load(): RoomState | null {
  try {
    return JSON.parse(readFileSync(FILE, 'utf8')) as RoomState
  } catch {
    // Файла нет или он испорчен — для вызывающего это одно и то же:
    // комната не подключена.
    return null
  }
}

export function save(state: RoomState): void {
  mkdirSync(dirname(FILE), { recursive: true })
  writeFileSync(FILE, JSON.stringify(state, null, 2), { mode: 0o600 })
  // Права выставляем и отдельно: при перезаписи существующего файла режим из
  // writeFileSync не применяется.
  chmodSync(FILE, 0o600)
}

export function clear(): void {
  if (existsSync(FILE)) writeFileSync(FILE, '', { mode: 0o600 })
}
