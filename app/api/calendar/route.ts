import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/gcal'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get('timeMin')
    const timeMax = searchParams.get('timeMax')

    console.log('Fetching calendar events for user:', session.user.email)
    const events = await getCalendarEvents(timeMin || undefined, timeMax || undefined, session.user.email)
    console.log('Successfully fetched', events.length, 'calendar events')

    return NextResponse.json({ events })

  } catch (error: any) {
    console.error('Calendar GET API error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { 
        error: 'Failed to fetch calendar events',
        details: error?.message || 'Unknown error',
        hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventData = await request.json()
    const event = await createCalendarEvent(eventData)

    return NextResponse.json({ event })

  } catch (error) {
    console.error('Calendar POST API error:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, ...eventData } = await request.json()
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const event = await updateCalendarEvent(eventId, eventData)

    return NextResponse.json({ event })

  } catch (error) {
    console.error('Calendar PATCH API error:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    await deleteCalendarEvent(eventId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Calendar DELETE API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    )
  }
}
