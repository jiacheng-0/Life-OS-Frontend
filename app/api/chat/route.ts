import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { chatWithGPT, extractGoalsFromMessage, type ChatMessage } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabaseClient'

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

    // Extract goals from the message
    const extractedGoals = await extractGoalsFromMessage(message, userProfile)

    // Build conversation context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are a personalized life coach AI assistant. You help users achieve their goals by:
1. Understanding their life priorities and constraints
2. Providing actionable advice and motivation
3. Helping them optimize their time and schedule
4. Remembering their preferences and past conversations

User's current goals: ${JSON.stringify(userProfile?.goals || [])}
User's preferences: ${JSON.stringify(userProfile?.preferences || {})}
User's routines: ${JSON.stringify(userProfile?.routines || [])}

IMPORTANT: Keep responses under 30 words. Use 2-3 sentences maximum. Be conversational, supportive, and practical.`
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
      const updatedGoals = [...(userProfile?.goals || []), ...extractedGoals.goals]
      const updatedConstraints = [...(userProfile?.constraints || []), ...extractedGoals.constraints]

      await supabaseAdmin
        .from('user_profiles')
        .update({
          goals: updatedGoals,
          constraints: updatedConstraints,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
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
