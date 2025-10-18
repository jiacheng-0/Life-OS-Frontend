'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { formatDate, formatTime, getTimeUntilEvent } from '@/lib/utils'

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

interface CalendarViewProps {
  events: CalendarEvent[]
  isLoading?: boolean
}

export function CalendarView({ events, isLoading = false }: CalendarViewProps) {
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayEventsList = events.filter(event => {
      const eventDate = event.start.dateTime 
        ? new Date(event.start.dateTime)
        : new Date(event.start.date!)
      return eventDate >= today && eventDate < tomorrow
    })

    const upcomingEventsList = events.filter(event => {
      const eventDate = event.start.dateTime 
        ? new Date(event.start.dateTime)
        : new Date(event.start.date!)
      return eventDate >= tomorrow
    }).slice(0, 5) // Show next 5 events

    setTodayEvents(todayEventsList)
    setUpcomingEvents(upcomingEventsList)
  }, [events])

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Events */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Today</h3>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {todayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events today</p>
              ) : (
                todayEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.summary}</p>
                      {event.start.dateTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(new Date(event.start.dateTime))}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Upcoming Events */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming</h3>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => {
                  const eventDate = event.start.dateTime 
                    ? new Date(event.start.dateTime)
                    : new Date(event.start.date!)
                  
                  return (
                    <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.summary}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(eventDate)}</span>
                          {event.start.dateTime && (
                            <>
                              <span>•</span>
                              <span>{formatTime(eventDate)}</span>
                              <span>•</span>
                              <span>{getTimeUntilEvent(eventDate)}</span>
                            </>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
