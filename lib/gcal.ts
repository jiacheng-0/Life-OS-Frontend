import { google } from 'googleapis'
import path from 'path'

let auth: any = null

function getAuth() {
  if (!auth) {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    
    if (!credentialsPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set')
    }
    
    // Resolve the path relative to the project root
    const absolutePath = path.resolve(process.cwd(), credentialsPath)
    console.log('Using Google credentials from:', absolutePath)
    
    auth = new google.auth.GoogleAuth({
      keyFile: absolutePath,
      scopes: ['https://www.googleapis.com/auth/calendar']
    })
  }
  return auth
}

export async function getCalendarEvents(timeMin?: string, timeMax?: string, userEmail?: string) {
  try {
    console.log('Getting auth client...')
    const authClient = await getAuth().getClient()
    console.log('Auth client obtained, creating calendar instance...')
    const calendar = google.calendar({ version: 'v3', auth: authClient })

    // For service accounts, we need to use the actual calendar ID (user's email)
    // First, try to get the calendar list to find the shared calendar
    let calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
    
    try {
      const calendarList = await calendar.calendarList.list()
      console.log('Available calendars:', calendarList.data.items?.map(c => ({ id: c.id, summary: c.summary })))
      
      // If we have a user email, use that as the calendar ID
      if (userEmail) {
        calendarId = userEmail
      } else if (calendarList.data.items && calendarList.data.items.length > 0) {
        // Use the first available calendar
        calendarId = calendarList.data.items[0].id!
      }
    } catch (listError) {
      console.log('Could not list calendars, using provided email or default:', listError)
      if (userEmail) {
        calendarId = userEmail
      }
    }

    const params = {
      calendarId,
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
      singleEvents: true,
      orderBy: 'startTime',
    }
    console.log('Fetching calendar events with params:', params)

    const response = await calendar.events.list(params)
    console.log('Calendar API response received:', response.data.items?.length || 0, 'events')

    return response.data.items || []
  } catch (error: any) {
    console.error('Google Calendar API error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      errors: error?.errors,
      response: error?.response?.data
    })
    throw new Error(`Failed to fetch calendar events: ${error?.message || 'Unknown error'}`)
  }
}

export async function createCalendarEvent(event: {
  summary: string
  description?: string
  start: { dateTime: string; timeZone?: string }
  end: { dateTime: string; timeZone?: string }
  location?: string
}) {
  try {
    const authClient = await getAuth().getClient()
    const calendar = google.calendar({ version: 'v3', auth: authClient })

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...event,
        start: {
          ...event.start,
          timeZone: event.start.timeZone || 'America/New_York'
        },
        end: {
          ...event.end,
          timeZone: event.end.timeZone || 'America/New_York'
        }
      }
    })

    return response.data
  } catch (error) {
    console.error('Google Calendar create event error:', error)
    throw new Error('Failed to create calendar event')
  }
}

export async function updateCalendarEvent(eventId: string, event: {
  summary?: string
  description?: string
  start?: { dateTime: string; timeZone?: string }
  end?: { dateTime: string; timeZone?: string }
  location?: string
}) {
  try {
    const authClient = await getAuth().getClient()
    const calendar = google.calendar({ version: 'v3', auth: authClient })

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: event
    })

    return response.data
  } catch (error) {
    console.error('Google Calendar update event error:', error)
    throw new Error('Failed to update calendar event')
  }
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    const authClient = await getAuth().getClient()
    const calendar = google.calendar({ version: 'v3', auth: authClient })

    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    })

    return { success: true }
  } catch (error) {
    console.error('Google Calendar delete event error:', error)
    throw new Error('Failed to delete calendar event')
  }
}
