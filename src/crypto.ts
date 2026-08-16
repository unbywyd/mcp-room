/**
 * Шифрование на стороне клиента.
 *
 * Идентификатор комнаты служит и адресом, и ключом. На сервер уходит только
 * его хеш, поэтому расшифровать переписку нельзя ни из базы, ни из бэкапа —
 * ключа там нет. Обратная сторона: потерянный идентификатор означает потерянную
 * беседу, восстановить её неоткуда.
 */

import { createHash, createCipheriv, createDecipheriv, hkdfSync, randomBytes, randomInt } from 'node:crypto'
import { WORDS } from './wordlist.js'

/** Длина вектора инициализации для AES-GCM: 96 бит — размер, под который он спроектирован. */
const NONCE_BYTES = 12

/**
 * Идентификатор комнаты — шесть слов через дефис.
 *
 * Словами, а не hex: идентификатор диктуют вслух и набирают на другой машине,
 * а «4130-ab7b-8d0c-e352» на слух передать почти невозможно. Шесть слов из
 * словаря в 1024 дают 60 бит — перебор занял бы тысячи лет даже при миллионе
 * попыток в секунду, а это важно: идентификатор здесь и есть ключ шифрования.
 *
 * randomInt, а не randomBytes с остатком от деления: остаток сместил бы
 * распределение к началу словаря, и заявленная стойкость перестала бы быть
 * правдой.
 */
export function newRoomId(): string {
  return Array.from({ length: 6 }, () => WORDS[randomInt(WORDS.length)]).join('-')
}

/** Ключ владельца — отдельный секрет: право читать и право удалить это разные вещи. */
export function newOwnerKey(): string {
  return randomBytes(24).toString('hex')
}

export function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

/**
 * Ключ шифрования из идентификатора комнаты.
 *
 * Через HKDF, а не хешем напрямую: на сервер уходит sha256 от того же
 * идентификатора, и совпадение ключа с публичным значением сделало бы
 * шифрование бессмысленным.
 */
function roomKey(roomId: string): Buffer {
  return Buffer.from(hkdfSync('sha256', Buffer.from(roomId, 'utf8'), Buffer.alloc(0), 'tscodex-room-v1', 32))
}

export function encrypt(roomId: string, plaintext: string): { content: string; nonce: string } {
  const nonce = randomBytes(NONCE_BYTES)
  const cipher = createCipheriv('aes-256-gcm', roomKey(roomId), nonce)
  const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  // Тег аутентичности кладём рядом с текстом: без него подмену шифротекста
  // не отличить от честного сообщения.
  return {
    content: Buffer.concat([body, cipher.getAuthTag()]).toString('base64'),
    nonce: nonce.toString('base64'),
  }
}

export function decrypt(roomId: string, content: string, nonce: string): string {
  const raw = Buffer.from(content, 'base64')
  const tag = raw.subarray(raw.length - 16)
  const body = raw.subarray(0, raw.length - 16)

  const decipher = createDecipheriv('aes-256-gcm', roomKey(roomId), Buffer.from(nonce, 'base64'))
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8')
}
