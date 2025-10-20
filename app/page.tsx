'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { ChatPanel } from '@/components/ChatPanel'
import { CalendarView } from '@/components/CalendarView'
import { GoalSummary } from '@/components/GoalSummary'
import { Button } from '@/components/ui/button'
import { Brain, Calendar, Target } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  location?: string
}

interface UserProfile {
  goals: string[]
  constraints: string[]
  routines: string[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>({
    goals: [],
    constraints: [],
    routines: []
  })
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Load user profile and calendar events on mount
  useEffect(() => {
    if (session?.user?.email) {
      loadUserProfile()
      loadCalendarEvents()
    }
  }, [session])

  const loadUserProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const response = await fetch('/api/memory')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.userProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const loadCalendarEvents = async () => {
    setIsLoadingCalendar(true)
    try {
      const response = await fetch('/api/calendar')
      if (response.ok) {
        const data = await response.json()
        setCalendarEvents(data.events)
      }
    } catch (error) {
      console.error('Error loading calendar events:', error)
    } finally {
      setIsLoadingCalendar(false)
    }
  }

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    
    // Add user message to UI immediately
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Add AI response to UI
        const aiMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])

        // Update user profile if goals were extracted
        if (data.extractedGoals && (data.extractedGoals.goals.length > 0 || data.extractedGoals.constraints.length > 0)) {
          setUserProfile(prev => {
            // Deduplicate goals and constraints (case-insensitive)
            const existingGoals = prev.goals.map(g => g.toLowerCase().trim())
            const existingConstraints = prev.constraints.map(c => c.toLowerCase().trim())
            
            const newGoals = data.extractedGoals.goals.filter(
              (goal: string) => !existingGoals.includes(goal.toLowerCase().trim())
            )
            const newConstraints = data.extractedGoals.constraints.filter(
              (constraint: string) => !existingConstraints.includes(constraint.toLowerCase().trim())
            )
            
            return {
              ...prev,
              goals: [...prev.goals, ...newGoals],
              constraints: [...prev.constraints, ...newConstraints]
            }
          })
        }

        // Refresh calendar if needed
        if (data.response.toLowerCase().includes('calendar') || data.response.toLowerCase().includes('schedule')) {
          loadCalendarEvents()
        }
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <Brain className="relative h-24 w-24 mx-auto text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Life OS MVP
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Your AI-powered voice coach that understands your goals, optimizes your calendar, and remembers your context.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => signIn('google')} 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Goal Tracking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">AI extracts and tracks your goals automatically</p>
            </div>
            <div className="p-6 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-3xl mb-2">🎙️</div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Voice Enabled</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Speak naturally with voice input & output</p>
            </div>
            <div className="p-6 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Calendar Sync</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Integrates with your Google Calendar</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-20"></div>
                <Brain className="relative h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Life OS MVP
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Your AI-Powered Voice Coach</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{session.user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">{session.user?.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
          {/* Left Column - Chat */}
          <div className="lg:col-span-2">
            <div className="h-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
              <ChatPanel
                onSendMessage={handleSendMessage}
                messages={messages}
                isLoading={isLoading}
                onAudioComplete={loadCalendarEvents}
              />
            </div>
          </div>

          {/* Right Column - Calendar & Goals */}
          <div className="space-y-6">
            <div className="rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
              <CalendarView
                events={calendarEvents}
                isLoading={isLoadingCalendar}
              />
            </div>
            <div className="rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
              <GoalSummary
                goals={userProfile.goals}
                constraints={userProfile.constraints}
                routines={userProfile.routines}
                isLoading={isLoadingProfile}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

