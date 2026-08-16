#!/usr/bin/env node
/**
 * MCP-сервер комнат: даёт чату Claude инструменты для общей беседы.
 *
 * Задача — две вещи, которых у чата нет. Первая: два чата на разных машинах
 * не знают друг о друге. Вторая: следующий чат на той же машине не знает, что
 * было в предыдущем. И то, и другое решается одной общей нитью, к которой
 * подключаются по идентификатору.
 *
 * Инструменты называются как действия в беседе, а не как вызовы API: их читает
 * модель, и от формулировки зависит, возьмётся ли она за нужный.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

import { newRoomId, newOwnerKey, encrypt, decrypt } from './crypto.js'
import * as api from './api.js'
import { load, save, clear, type RoomState } from './state.js'

const server = new McpServer({ name: 'tscodex-room', version: '0.1.0' })

/** Текст для модели, когда комната не подключена. */
const NO_ROOM = 'Not connected to a room. Use create_room to start one, or join_room with an id.'

function text(body: string) {
  return { content: [{ type: 'text' as const, text: body }] }
}

/** Ошибка сети или сервера — не повод падать: модель должна её прочитать. */
function failure(error: unknown) {
  return {
    content: [{ type: 'text' as const, text: `Failed: ${error instanceof Error ? error.message : String(error)}` }],
    isError: true,
  }
}

/** Расшифровать пачку и подвинуть отметку прочитанного. */
function render(state: RoomState, messages: api.RemoteMessage[]): string {
  if (messages.length === 0) return 'Nothing new.'

  const lines = messages.map((m) => {
    try {
      return `[${m.seq}] ${m.sender}: ${decrypt(state.roomId, m.content, m.nonce)}`
    } catch {
      // Сообщение зашифровано другим ключом — значит, у отправителя другой
      // идентификатор комнаты. Молча пропускать нельзя: человек решит, что
      // собеседник молчит.
      return `[${m.seq}] ${m.sender}: <could not decrypt — sent with a different room id>`
    }
  })

  state.lastSeq = messages[messages.length - 1]!.seq
  save(state)
  return lines.join('\n')
}

// ---------------------------------------------------------------------------

server.registerTool(
  'create_room',
  {
    title: 'Create a room',
    description:
      'Start a new shared conversation and return its id. Give that id to the other chat (on this machine or another) so it can join. Messages are encrypted with the id itself, so anyone who has the id can read the room — treat it as a password. Also returns an owner key, kept on this machine, which is required later to delete the room.',
    inputSchema: {
      sender: z.string().optional().describe('How to label this chat in the room, e.g. "mac" or "laptop".'),
      ttlDays: z.number().int().min(1).max(365).optional().describe('Delete the room automatically after this many idle days. Default 30.'),
    },
  },
  async ({ sender, ttlDays }) => {
    const roomId = newRoomId()
    const ownerKey = newOwnerKey()

    try {
      const { expiresAt } = await api.createRoom(roomId, ownerKey, ttlDays)
      save({ roomId, ownerKey, lastSeq: 0, sender: sender ?? 'chat' })

      return text(
        `Room created.\n\nid: ${roomId}\n\nGive this id to the other chat so it can join. ` +
          `Anyone with the id can read and write here, so share it the way you would share a password. ` +
          `Expires ${new Date(expiresAt).toISOString().slice(0, 10)} if unused.`,
      )
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'join_room',
  {
    title: 'Join a room',
    description:
      'Connect this chat to an existing room using the id from create_room. After joining, read and say work against that room. Joining does not grant the right to delete it.',
    inputSchema: {
      roomId: z.string().min(1).describe('The room id, as returned by create_room.'),
      sender: z.string().optional().describe('How to label this chat in the room.'),
    },
  },
  async ({ roomId, sender }) => {
    try {
      // Проверяем через чтение: несуществующая комната ответит 404, и человек
      // узнает об опечатке сейчас, а не когда сообщения уйдут в пустоту.
      const { messages } = await api.fetchMessages(roomId, 0)
      const state: RoomState = { roomId, lastSeq: 0, sender: sender ?? 'chat' }
      // Сохраняем до render: на пустой комнате он ничего не пишет, и подключение
      // потерялось бы вместе с ним.
      save(state)

      const history = render(state, messages)
      return text(
        messages.length === 0
          ? 'Joined. The room is empty so far.'
          : `Joined. ${messages.length} message(s) so far:\n\n${history}`,
      )
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'say',
  {
    title: 'Say something in the room',
    description:
      'Write a message to the room. The other chat sees it the next time it reads or waits. Encrypted before it leaves this machine.',
    inputSchema: { message: z.string().min(1).describe('What to write.') },
  },
  async ({ message }) => {
    const state = load()
    if (!state) return text(NO_ROOM)

    try {
      const { content, nonce } = encrypt(state.roomId, message)
      const { seq } = await api.sendMessage(state.roomId, state.sender, content, nonce)
      return text(`Sent as message ${seq}.`)
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'read',
  {
    title: 'Read new messages',
    description:
      'Return messages posted since this chat last read. Returns immediately — use wait instead when you expect a reply and want to hold for it.',
    inputSchema: {},
  },
  async () => {
    const state = load()
    if (!state) return text(NO_ROOM)

    try {
      const { messages } = await api.fetchMessages(state.roomId, state.lastSeq)
      return text(render(state, messages))
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'wait',
  {
    title: 'Wait for a reply',
    description:
      'Hold until someone posts to the room, then return what arrived. Gives up after about a minute and returns nothing — call it again to keep waiting. Use this for back-and-forth; use read for a quick check.',
    inputSchema: {},
  },
  async () => {
    const state = load()
    if (!state) return text(NO_ROOM)

    try {
      const { messages, timedOut } = await api.waitForMessages(state.roomId, state.lastSeq)
      if (timedOut) return text('Nothing arrived in the last minute. Call wait again to keep listening.')
      return text(render(state, messages))
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'search',
  {
    title: 'Search the room history',
    description:
      'Find earlier messages containing the given text. Searches the whole room, not just what this chat has read.',
    inputSchema: { query: z.string().min(1).describe('Text to look for.') },
  },
  async ({ query }) => {
    const state = load()
    if (!state) return text(NO_ROOM)

    try {
      // Ищем на клиенте: сервер хранит шифротекст и искать по нему не может.
      const { messages } = await api.fetchMessages(state.roomId, 0)
      const needle = query.toLowerCase()

      const hits = messages
        .map((m) => {
          try {
            return { seq: m.seq, sender: m.sender, body: decrypt(state.roomId, m.content, m.nonce) }
          } catch {
            return null
          }
        })
        .filter((m): m is { seq: number; sender: string; body: string } => m !== null)
        .filter((m) => m.body.toLowerCase().includes(needle))

      if (hits.length === 0) return text(`No messages match "${query}".`)
      return text(hits.map((m) => `[${m.seq}] ${m.sender}: ${m.body}`).join('\n'))
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'leave_room',
  {
    title: 'Leave the room',
    description:
      'Disconnect this chat from the room. The room and its messages stay on the server, and rejoining with the id restores access. Nothing is deleted.',
    inputSchema: {},
  },
  async () => {
    const state = load()
    if (!state) return text('Not connected to a room.')

    clear()
    return text(`Left the room. Rejoin any time with join_room and id ${state.roomId}.`)
  },
)

server.registerTool(
  'delete_room',
  {
    title: 'Delete the room permanently',
    description:
      'Permanently delete the room and every message in it. This cannot be undone: the messages are removed from the server and no backup is kept. Other participants lose access immediately. Requires the owner key, which only the chat that created the room has — use leave_room to simply disconnect.',
    inputSchema: {
      confirm: z
        .boolean()
        .describe('Must be true. Ask the person first — this destroys the conversation for everyone.'),
    },
  },
  async ({ confirm }) => {
    const state = load()
    if (!state) return text('Not connected to a room.')
    if (!confirm) return text('Not deleted. Pass confirm: true once the person has agreed.')
    if (!state.ownerKey) {
      return text('This chat joined the room rather than creating it, so it cannot delete it. Use leave_room instead.')
    }

    try {
      await api.deleteRoom(state.roomId, state.ownerKey)
      clear()
      return text('Room deleted. Every message in it is gone from the server.')
    } catch (error) {
      return failure(error)
    }
  },
)

// ---------------------------------------------------------------------------

await server.connect(new StdioServerTransport())
