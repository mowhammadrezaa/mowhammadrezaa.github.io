# puter-resume-chat

A reusable React chatbot powered by [Puter.js](https://docs.puter.com/) that answers questions about **one person**, using a resume / knowledge-base you supply.

Designed for portfolio sites: concise answers, suggested prompts, and a hard scope so off-topic questions are politely declined.

## Features

- Floating launcher + polished chat panel
- Streaming replies via `puter.ai.chat`
- System prompt that locks the bot to your person
- Ready-made example questions
- Zero site API keys — Puter’s browser SDK authenticates the visiting user
- Self-contained CSS module (no Tailwind required)

## Install / use in this repo

```tsx
import {PuterResumeChat} from '../packages/puter-resume-chat/src'

export function SiteChat() {
  return (
    <PuterResumeChat
      personName="Ada Lovelace"
      knowledgeBase={`Ada Lovelace was…`}
      suggestedQuestions={[
        'What is Ada known for?',
        'Where did she work?',
      ]}
    />
  )
}
```

Mount the client component once in your layout (e.g. next to the footer).

## Props

| Prop | Type | Description |
|------|------|-------------|
| `personName` | `string` | Required. The person this bot knows. |
| `knowledgeBase` | `string` | Required. Plain-text facts (resume, bio, projects). |
| `suggestedQuestions` | `string[]` | Example chips shown before the first message. |
| `title` / `subtitle` / `intro` | `string` | Panel copy overrides (`subtitle` hidden if omitted). |
| `launcherLabel` | `string` | Floating button label. |
| `model` | `string` | Puter model id (default `gpt-5.4-nano`). |
| `defaultOpen` | `boolean` | Start with the panel open. |

## Scope behavior

The system prompt instructs the model to:

1. Answer only questions about `personName`
2. Stay concise and factual to the knowledge base
3. Decline unrelated questions and restate the bot’s purpose

## Open sourcing

This package is MIT-licensed and intentionally isolated under `packages/puter-resume-chat/`. You can copy the folder into another repo or publish it to npm as `puter-resume-chat`.

## Notes

- Runs in the browser only (`'use client'`).
- Uses Puter’s public SDK with visitor sign-in — no owner API key is passed or stored.
- Keep `knowledgeBase` updated when the resume changes.
