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

    const events = await getCalendarEvents(timeMin || undefined, timeMax || undefined)

    return NextResponse.json({ events })

  } catch (error) {
    console.error('Calendar GET API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
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
