'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Clock, Settings } from 'lucide-react'

interface GoalSummaryProps {
  goals: string[]
  constraints: string[]
  routines: string[]
  isLoading?: boolean
}

export function GoalSummary({ goals, constraints, routines, isLoading = false }: GoalSummaryProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
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
          <Target className="h-5 w-5" />
          Goals & Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goals */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Current Goals
          </h3>
          <div className="space-y-2">
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals set yet</p>
            ) : (
              goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm">{goal}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Constraints */}
        {constraints.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Constraints
            </h3>
            <div className="space-y-2">
              {constraints.map((constraint, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 mt-2" />
                  <p className="text-sm">{constraint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Routines */}
        {routines.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Routines
            </h3>
            <div className="space-y-2">
              {routines.map((routine, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <p className="text-sm">{routine}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
