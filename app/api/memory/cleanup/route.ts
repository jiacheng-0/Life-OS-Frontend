import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'

// Utility function to deduplicate array (case-insensitive)
function deduplicateArray(arr: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  
  for (const item of arr) {
    const normalized = item.toLowerCase().trim()
    if (!seen.has(normalized)) {
      seen.add(normalized)
      result.push(item)
    }
  }
  
  return result
}

export async function POST(request: NextRequest) {
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

    // Get user profile
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Deduplicate goals, constraints, and routines
    const deduplicatedGoals = deduplicateArray(userProfile.goals || [])
    const deduplicatedConstraints = deduplicateArray(userProfile.constraints || [])
    const deduplicatedRoutines = deduplicateArray(userProfile.routines || [])

    // Update user profile with deduplicated data
    const { data: updatedProfile, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        goals: deduplicatedGoals,
        constraints: deduplicatedConstraints,
        routines: deduplicatedRoutines,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    const removed = {
      goals: (userProfile.goals?.length || 0) - deduplicatedGoals.length,
      constraints: (userProfile.constraints?.length || 0) - deduplicatedConstraints.length,
      routines: (userProfile.routines?.length || 0) - deduplicatedRoutines.length
    }

    return NextResponse.json({
      success: true,
      message: 'Duplicates removed successfully',
      removed,
      userProfile: updatedProfile
    })

  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json(
      { error: 'Failed to clean up duplicates' },
      { status: 500 }
    )
  }
}

