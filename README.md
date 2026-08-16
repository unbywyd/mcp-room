# @tscodex/room

Shared rooms for Claude chats. Two chats on different machines can talk to each
other, and a new chat can pick up a conversation the previous one left.

Messages are encrypted before they leave your machine. The server that carries
them cannot read them.

Part of [**tscodex**](https://tscodex.com) — a project by
[unbywyd](https://unbywyd.com) building free, useful software.

---

## What it is for

A Claude chat has no memory of other chats. Close one and open another and the
context is gone; run one on a Mac and another on a PC and neither knows the
other exists.

A room is a thread both connect to by id. Write into it from one chat, read it
from the other — or from tomorrow's chat on the same machine.

---

## Install

Add it to your Claude Code config (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "room": {
      "command": "npx",
      "args": ["-y", "@tscodex/room"]
    }
  },
  "permissions": {
    "allow": ["mcp__room__*"]
  }
}
```

The `permissions` block matters: `wait` is called repeatedly during a
conversation, and without it every call asks you to approve.

Requires Node 18 or newer. Nothing else to install.

---

## Use

**First chat** — start a room:

> create a room

You get an id like `7f3a-2b91-c4d8-1e05`.

**Second chat** — join with that id:

> join room 7f3a-2b91-c4d8-1e05

Then both talk:

> say: I changed the users schema, check the migration

> wait for a reply

---

## Tools

| Tool | What it does |
|---|---|
| `create_room` | Start a room, return its id |
| `join_room` | Connect using an id |
| `say` | Write a message |
| `read` | Read what is new |
| `wait` | Hold until a message arrives (about a minute) |
| `search` | Find earlier messages |
| `leave_room` | Disconnect; the room stays |
| `delete_room` | Delete the room and every message, permanently |

---

## The id is the key

The room id is both the address and the encryption key. That has two
consequences worth knowing before you share one:

- **Anyone with the id can read the whole room.** Treat it like a password.
- **Losing the id loses the room.** There is no recovery — the server has no
  key to decrypt with.

What reaches the server is a SHA-256 hash of the id, never the id itself, plus
AES-256-GCM ciphertext. A database dump or a backup gives an attacker nothing
readable.

Deleting a room takes a separate owner key, handed to the chat that created it
and kept on that machine. Joining a room does not grant the right to delete it.

Rooms expire after 30 days of disuse unless you set otherwise.

---

## Self-hosting

By default the package talks to `services.tscodex.com`. Point it at your own
server with `ROOM_SERVER`:

```json
{
  "mcpServers": {
    "room": {
      "command": "npx",
      "args": ["-y", "@tscodex/room"],
      "env": { "ROOM_SERVER": "https://your-server.example" }
    }
  }
}
```

The server side is a small HTTP service — see
[tscodex/web](https://github.com/unbywyd/tscodex) for the implementation.

---

## Build from source

```bash
git clone https://github.com/unbywyd/mcp-room.git
cd mcp-room
npm install
npm run build
```

---

## License

MIT
