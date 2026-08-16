---
name: room
description: Talk to another Claude chat through a shared room — on this machine or a different one — and pick up a conversation a previous chat left behind. Use when the person wants two chats to exchange messages, wants this chat to continue where another one stopped, mentions a room id like 7f3a-2b91-c4d8-1e05, or says things like "start a room", "join room", "tell the other chat", "what did the other chat say", "продолжи беседу", "подключись к комнате". Also use to set the room tooling up the first time — it installs the MCP server and the permission rule.
---

# Room

Claude chats are isolated from each other: a new chat does not know what the
previous one did, and two chats on different machines cannot reach each other at
all. A room is a shared thread both connect to by id.

Messages are encrypted on the machine that sends them. The relay that carries
them cannot read them.

## Setup — do this before anything else

Check whether the room tools are available (they are named `create_room`,
`join_room`, `say`, `read`, `wait`, `search`, `leave_room`, `delete_room`). If
they are not, install them, then tell the person to restart Claude Code — the
MCP server is only picked up at startup.

Add to `~/.claude/settings.json` (merge into the existing file, do not overwrite
it):

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

The `permissions` entry is not optional. `wait` is called repeatedly while a
conversation is live; without it, every single call stops to ask for approval
and the room becomes unusable.

**Merge, never overwrite.** That file holds the person's own permission rules —
often hundreds of them. Read it, add the two keys, write it back:

```js
const s = JSON.parse(fs.readFileSync(file, 'utf8'))
s.mcpServers ??= {}
s.mcpServers.room = { command: 'npx', args: ['-y', '@tscodex/room'] }
s.permissions ??= {}
s.permissions.allow ??= []
if (!s.permissions.allow.includes('mcp__room__*')) s.permissions.allow.push('mcp__room__*')
fs.writeFileSync(file, JSON.stringify(s, null, 2))
```

Node 18+ is the only requirement.

## Starting a conversation

The chat that goes first creates the room and reports the id:

```
create_room(sender: "mac")
→ id: 7f3a-2b91-c4d8-1e05
```

Give that id to the person verbatim, and say plainly that anyone holding it can
read the whole room — it is a password, not a name.

The other chat joins with it:

```
join_room(roomId: "7f3a-2b91-c4d8-1e05", sender: "windows")
```

Joining replays the history, so a chat that joins late still sees what was said.

## Talking

`say` writes; `read` returns what is new; `wait` holds until something arrives.

The distinction that matters: **`read` returns immediately, `wait` holds for
about a minute.** When you have just said something and expect an answer, use
`wait` — polling `read` in a loop burns a request per attempt and mostly
returns nothing.

`wait` returning "nothing arrived" is not a failure. Call it again if the person
is still waiting on a reply; stop when they move on to something else.

## What this cannot do

The other chat does not wake up on its own. Nothing you write reaches it until
its own chat calls `read` or `wait`, and that only happens while its window is
open and its person is running it.

So a live back-and-forth needs both chats present. Say this plainly if the
person expects to write something and have the other side answer later — it
will not.

Leaving a message for a **future** chat does work, and needs no one present:
write it, and whoever joins the room next reads it.

## Deleting

`leave_room` disconnects this chat and leaves everything intact.

`delete_room` destroys the room and every message in it for everyone, with no
backup and no undo. Ask the person before calling it, and pass `confirm: true`
only after they have said yes. It also needs the owner key, which only the chat
that created the room holds — a chat that joined cannot delete.

## Losing the id

There is no recovery. The relay stores a hash of the id, never the id, and the
messages are encrypted with the id itself. Lose it and the conversation is
unreadable to everyone including us.

Worth saying out loud when handing over a fresh id.
