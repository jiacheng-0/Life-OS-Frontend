import { google } from 'googleapis'

let auth: any = null

function getAuth() {
  if (!auth) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!)
    
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar']
    })
  }
  return auth
}

export async function getCalendarEvents(timeMin?: string, timeMax?: string) {
  try {
    const authClient = await getAuth().getClient()
    const calendar = google.calendar({ version: 'v3', auth: authClient })

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items || []
  } catch (error) {
    console.error('Google Calendar API error:', error)
    throw new Error('Failed to fetch calendar events')
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
