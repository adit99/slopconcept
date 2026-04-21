import { NextRequest } from 'next/server'
import { getClaudeClient } from '@/lib/claude'
import { buildReplyChatSystem } from '@/lib/extraction'
import { ChatMessage } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { messages, xDescription, moments }: {
      messages: ChatMessage[]
      xDescription: string
      moments: string[]
    } = await request.json()

    if (!messages?.length || !xDescription) {
      return new Response('bad request', { status: 400 })
    }

    const claude = getClaudeClient()
    const stream = await claude.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: buildReplyChatSystem(xDescription, moments ?? []),
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('chat error:', err)
    return new Response('internal error', { status: 500 })
  }
}
