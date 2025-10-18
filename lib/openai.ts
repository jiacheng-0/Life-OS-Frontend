import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-openai-key',
})

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ExtractedGoals {
  goals: string[]
  constraints: string[]
  intents: string[]
  timePreferences: string[]
}

export async function chatWithGPT(messages: ChatMessage[]): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 100, // Limit to ~30 words
    })

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to get AI response')
  }
}

export async function extractGoalsFromMessage(userMessage: string, userContext?: any): Promise<ExtractedGoals> {
  const systemPrompt = `You are a life coach AI that extracts goals, constraints, and intents from user messages. 
  Analyze the user's message and extract:
  1. Specific goals they want to achieve
  2. Constraints or limitations they mentioned
  3. Key intents or desires
  4. Time preferences or scheduling needs

  Return ONLY a valid JSON object (no markdown, no code blocks) with these exact keys: goals, constraints, intents, timePreferences.
  Each should be an array of strings.

  User context: ${JSON.stringify(userContext || {})}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content || '{}'
    
    // Remove markdown code blocks if present
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }
    
    return JSON.parse(cleanedResponse)
  } catch (error) {
    console.error('Goal extraction error:', error)
    return {
      goals: [],
      constraints: [],
      intents: [],
      timePreferences: []
    }
  }
}

export async function generateCalendarPlan(goals: ExtractedGoals, existingEvents: any[]): Promise<string> {
  const systemPrompt = `You are a calendar optimization AI. Based on the user's goals and existing calendar events, 
  generate a 2-week time-block plan. Consider:
  - User's goals and priorities
  - Existing commitments
  - Time preferences
  - Work-life balance

  Return a detailed plan with specific time blocks and recommendations.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Goals: ${JSON.stringify(goals)}\nExisting events: ${JSON.stringify(existingEvents)}` }
      ],
      temperature: 0.5,
      max_tokens: 800,
    })

    return completion.choices[0]?.message?.content || 'Could not generate calendar plan.'
  } catch (error) {
    console.error('Calendar planning error:', error)
    throw new Error('Failed to generate calendar plan')
  }
}
