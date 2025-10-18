'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { VoiceButton } from './VoiceButton'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatPanelProps {
  onSendMessage: (message: string) => Promise<void>
  messages: Message[]
  isLoading: boolean
}

export function ChatPanel({ onSendMessage, messages, isLoading }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [lastAiResponse, setLastAiResponse] = useState<string>('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    await onSendMessage(message)
  }

  const handleVoiceInput = async (text: string) => {
    if (isLoading) return
    await onSendMessage(text)
  }

  const handlePlayAudio = async () => {
    // Get the last AI message
    const lastAiMessage = messages.filter(m => m.role === 'assistant').pop()
    if (!lastAiMessage) {
      console.log('No AI message to play')
      return
    }

    try {
      // Fetch audio from the API
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: lastAiMessage.content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const data = await response.json()
      return data.audio // Return the base64 audio data
    } catch (error) {
      console.error('Error fetching audio:', error)
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="h-full flex flex-col border-0 shadow-none bg-transparent">
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  <Bot className="relative h-16 w-16 mx-auto text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Start a conversation</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Chat with your AI life coach</p>
                <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">💡 Try: "Help me sleep earlier and see my kids more"</p>
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className={`text-sm whitespace-pre-wrap leading-relaxed ${message.role === 'assistant' ? 'text-slate-700 dark:text-slate-300' : ''}`}>{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 rounded-xl border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
            />
            <VoiceButton
              onVoiceInput={handleVoiceInput}
              onPlayAudio={handlePlayAudio}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-4 shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
