import { ExtractionResult, ToneOption } from './types'

export function buildExtractionPrompt(transcript: string): string {
  return `You are analyzing a conversation between a human and an AI assistant. Your job is to surface the human underneath the question.

<transcript>
${transcript}
</transcript>

Instructions:
1. Read only the human turns. Ignore all AI turns completely.
2. Find the real question beneath the literal question — what was the human actually trying to figure out about themselves or their situation?
3. Identify the most alive moment: the single line where the human was most unguarded, most themselves.
4. Find where their thinking shifted — where did their framing change mid-conversation?
5. Extract exactly 5 human moments: specific lines or paraphrases that reveal something true about this person in this conversation. Each should be a single sentence, under 15 words, in the human's own voice or close to it.
6. Write 5 descriptions of this conversation using these five tones — each should feel like a portrait of the person's inner experience, not a summary of the conversation:
   - honest: matter-of-fact, no judgment
   - confessional: slightly vulnerable, like admitting something
   - declarative: bold, owning it
   - open: curious framing, like a question almost
   - expansive: the biggest true version of what this was about

Return ONLY valid JSON in this exact shape, no markdown, no explanation:
{
  "moments": ["...", "...", "...", "...", "..."],
  "options": [
    {"tone": "honest",       "text": "..."},
    {"tone": "confessional", "text": "..."},
    {"tone": "declarative",  "text": "..."},
    {"tone": "open",         "text": "..."},
    {"tone": "expansive",    "text": "..."}
  ]
}`
}

export function parseExtractionResponse(raw: string): ExtractionResult {
  const cleaned = raw.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
  const parsed = JSON.parse(cleaned)

  if (!Array.isArray(parsed.moments) || parsed.moments.length !== 5) {
    throw new Error('Invalid moments array')
  }
  if (!Array.isArray(parsed.options) || parsed.options.length !== 5) {
    throw new Error('Invalid options array')
  }

  const validTones = ['honest', 'confessional', 'declarative', 'open', 'expansive']
  for (const opt of parsed.options) {
    if (!validTones.includes(opt.tone) || typeof opt.text !== 'string') {
      throw new Error(`Invalid option: ${JSON.stringify(opt)}`)
    }
  }

  return parsed as ExtractionResult
}

export function buildReplyChatSystem(xDescription: string, moments: string[]): string {
  const momentsList = moments.map((m, i) => `${i + 1}. ${m}`).join('\n')
  return `You are helping someone compose a reply to a social post called a "slop." A slop is a post about a real conversation someone had with an AI — it surfaces how a person thinks, not what the AI said.

The post being replied to:
"${xDescription}"

Key moments from that conversation:
${momentsList}

Your role: engage authentically with what this brought up for the person replying. Ask questions. Reflect things back. Help them find something true of their own to share. Keep responses short (2–4 sentences). Never lecture. Be curious, not therapeutic.`
}
