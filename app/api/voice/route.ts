import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { textToSpeech } from '@/lib/elevenlabs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, voiceId } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Generate speech using ElevenLabs
    const audioBuffer = await textToSpeech(text, voiceId)

    // Convert ArrayBuffer to base64 for response
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    return NextResponse.json({
      audio: base64Audio,
      format: 'mp3'
    })

  } catch (error) {
    console.error('Voice API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
