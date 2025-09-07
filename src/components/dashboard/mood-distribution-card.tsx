"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MOOD_TYPES } from '@/lib/hooks/useMood'

type DailySummary = {
  date: string
  total_entries: number
  mood_distribution: Record<string, number>
}

type Props = {
  summary: DailySummary
}

export function MoodDistributionCard({ summary }: Props) {
  if (!summary || !summary.mood_distribution) return null

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Ruh Hali Dağılımı</CardTitle>
        <CardDescription>
          Bugünkü mood kayıtlarınızın dağılımı
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(summary.mood_distribution).map(([mood, count]) => {
            const percentage = (count / summary.total_entries) * 100
            const moodInfo = MOOD_TYPES[mood as keyof typeof MOOD_TYPES]
            return (
              <div key={mood} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-24">
                  <span className="text-xl">{moodInfo?.emoji}</span>
                  <span className="text-sm font-medium">{moodInfo?.label}</span>
                </div>
                <div className="flex-1">
                  <Progress value={percentage} className="h-2" />
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


