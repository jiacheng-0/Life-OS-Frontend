export async function textToSpeech(text: string, voiceId?: string): Promise<ArrayBuffer> {
  try {
    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.30,
            similarity_boost: 0.80,
            style: 0.20,
            use_speaker_boost: true
          },
          optimize_streaming_latency: 0,
          output_format: 'mp3_44100_128'
        })
      }
    )

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    return await response.arrayBuffer()
  } catch (error) {
    console.error('ElevenLabs TTS error:', error)
    throw new Error('Failed to generate speech')
  }
}

export async function getAvailableVoices() {
  try {
    // Mock voices for now
    return [
      { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Default Voice' }
    ]
  } catch (error) {
    console.error('Error fetching voices:', error)
    return []
  }
}

// Real-time voice conversation (WebSocket-based)
export function createRealtimeVoiceConnection(voiceId?: string) {
  // This would be implemented for real-time voice chat
  // For now, we'll use the standard TTS approach
  throw new Error('Real-time voice not implemented yet')
}