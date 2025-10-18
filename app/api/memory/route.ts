import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user profile (memory context)
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get recent conversations
    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10)

    return NextResponse.json({
      userProfile: userProfile || {
        goals: [],
        preferences: {},
        routines: []
      },
      recentConversations: conversations || []
    })

  } catch (error) {
    console.error('Memory GET API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memory context' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { goals, preferences, routines } = await request.json()

    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user profile
    const { data: updatedProfile } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        goals: goals || [],
        preferences: preferences || {},
        routines: routines || [],
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    return NextResponse.json({ userProfile: updatedProfile })

  } catch (error) {
    console.error('Memory PUT API error:', error)
    return NextResponse.json(
      { error: 'Failed to update memory context' },
      { status: 500 }
    )
  }
}
