import { NextRequest, NextResponse } from 'next/server'
import { getClaudeClient } from '@/lib/claude'
import { buildExtractionPrompt, parseExtractionResponse } from '@/lib/extraction'

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
      return NextResponse.json({ error: 'transcript too short' }, { status: 400 })
    }

    const claude = getClaudeClient()
    const message = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildExtractionPrompt(transcript) }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = parseExtractionResponse(raw)

    return NextResponse.json(result)
  } catch (err) {
    console.error('extraction error:', err)
    return NextResponse.json({ error: 'extraction failed' }, { status: 500 })
  }
}
