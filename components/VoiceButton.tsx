'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2 } from 'lucide-react'

interface VoiceButtonProps {
  onVoiceInput: (text: string) => void
  onPlayAudio: () => Promise<string | undefined>
  disabled?: boolean
}

export function VoiceButton({ onVoiceInput, onPlayAudio, disabled = false }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const finalTranscriptRef = useRef<string>('')

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    
    finalTranscriptRef.current = ''

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Update final transcript accumulator
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript + ' '
      }

      // Reset silence timer whenever speech is detected
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }

      // Set a new timer to stop after 1 second of silence
      silenceTimerRef.current = setTimeout(() => {
        if (recognitionRef.current && finalTranscriptRef.current.trim()) {
          recognitionRef.current.stop()
        }
      }, 1000) // 1 second of silence before stopping
    }

    recognition.onend = () => {
      setIsListening(false)
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      
      // Send the final accumulated transcript
      if (finalTranscriptRef.current.trim()) {
        onVoiceInput(finalTranscriptRef.current.trim())
        finalTranscriptRef.current = ''
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }
  }

  const handlePlayAudio = async () => {
    try {
      setIsPlaying(true)
      
      // Fetch audio data from the parent component
      const audioData = await onPlayAudio()
      
      if (!audioData) {
        console.log('No audio data received')
        setIsPlaying(false)
        return
      }
      
      // Convert base64 to blob
      const binaryString = atob(audioData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsPlaying(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={`relative rounded-xl shadow-md hover:shadow-lg transition-all ${
          isListening 
            ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0' 
            : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        {isListening ? (
          <MicOff className="h-4 w-4 relative z-10" />
        ) : (
          <Mic className="h-4 w-4 relative z-10" />
        )}
        {isListening && (
          <div className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-75" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handlePlayAudio}
        disabled={disabled || isPlaying}
        className={`relative rounded-xl shadow-md hover:shadow-lg transition-all border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 ${
          isPlaying ? 'bg-blue-50 dark:bg-blue-950/30' : ''
        }`}
      >
        <Volume2 className={`h-4 w-4 relative z-10 ${isPlaying ? 'text-blue-600 dark:text-blue-400' : ''}`} />
        {isPlaying && (
          <div className="absolute inset-0 rounded-xl bg-blue-400 animate-ping opacity-50" />
        )}
      </Button>
    </div>
  )
}
