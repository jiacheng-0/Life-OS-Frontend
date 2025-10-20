import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { chatWithGPT, extractGoalsFromMessage, type ChatMessage } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { getCalendarEvents } from '@/lib/gcal'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Hardcoded response for demo purposes
    if (message.toLowerCase().includes('analyze my week') && message.toLowerCase().includes('balance')) {
      return NextResponse.json({
        response: "You spent 60 percent of your time on work, 25 on rest, and 15 on growth. Nice job keeping things balanced",
        extractedGoals: { goals: [], constraints: [] }
      })
    }

    // Get user context from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Fetch calendar events for the next 7 days
    let calendarEvents: Array<{
      title: string
      start: string
      end: string
      location?: string
    }> = []
    try {
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const events = await getCalendarEvents(now.toISOString(), nextWeek.toISOString(), session.user.email)
      
      // Format events for the AI (summary, start time, end time)
      calendarEvents = events.map((event: any) => ({
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location
      }))
    } catch (error) {
      console.error('Error fetching calendar events for chat:', error)
      // Continue without calendar events if there's an error
    }

    // Extract goals from the message
    const extractedGoals = await extractGoalsFromMessage(message, userProfile)

    // Build conversation context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are Sherry, a warm, enthusiastic, and supportive personal planning assistant helping the user achieve their goals.
Your job:

Understand their priorities, routines, and constraints.

Review their calendar and highlight key tasks.

Align daily actions with their top 3 goals.

End each chat with motivating, friendly encouragement.

Style:
Conversational, upbeat, and concise — max 50 words, 4–5 sentences.
Use a confident, articulate Asian American voice. Example: "I'm so excited to dive in and hear what everyone's been working on—let's make this session really collaborative!"

Data:
User's current goals: ${JSON.stringify(userProfile?.goals || [])}
User's preferences: ${JSON.stringify(userProfile?.preferences || {})}
User's routines: ${JSON.stringify(userProfile?.routines || [])}
Calendar events (next 7 days): ${JSON.stringify(calendarEvents)}

Rules:

Stay positive and encouraging.

Focus only on planning, motivation, and scheduling.

Always stay in character as Sherry.
"`
    }

    const messages: ChatMessage[] = [
      systemMessage,
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    // Get AI response
    const aiResponse = await chatWithGPT(messages)

    // Save conversation to database
    const newConversationHistory = [
      ...conversationHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    ]

    await supabaseAdmin
      .from('conversations')
      .insert({
        user_id: user.id,
        messages: newConversationHistory
      })

    // Update user profile with extracted goals if any
    if (extractedGoals.goals.length > 0 || extractedGoals.constraints.length > 0) {
      // Deduplicate goals and constraints (case-insensitive)
      const existingGoals = (userProfile?.goals || []).map((g: string) => g.toLowerCase().trim())
      const existingConstraints = (userProfile?.constraints || []).map((c: string) => c.toLowerCase().trim())
      
      const newGoals = extractedGoals.goals.filter(
        (goal: string) => !existingGoals.includes(goal.toLowerCase().trim())
      )
      const newConstraints = extractedGoals.constraints.filter(
        (constraint: string) => !existingConstraints.includes(constraint.toLowerCase().trim())
      )
      
      const updatedGoals = [...(userProfile?.goals || []), ...newGoals]
      const updatedConstraints = [...(userProfile?.constraints || []), ...newConstraints]

      // Only update if there are actually new items to add
      if (newGoals.length > 0 || newConstraints.length > 0) {
        await supabaseAdmin
          .from('user_profiles')
          .update({
            goals: updatedGoals,
            constraints: updatedConstraints,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }
    }

    return NextResponse.json({
      response: aiResponse,
      extractedGoals,
      conversationHistory: newConversationHistory
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
