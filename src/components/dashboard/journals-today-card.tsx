"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOOD_TYPES } from '@/lib/hooks/useMood'
import type { JournalEntry } from '@/lib/hooks/useJournal'

type Props = {
  journals: JournalEntry[]
}

export function JournalsTodayCard({ journals }: Props) {
  if (!Array.isArray(journals) || journals.length === 0) return null

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Günlük Notlar</CardTitle>
        <CardDescription>Bugünkü notlarınız</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {journals.map((j) => {
            const mood = MOOD_TYPES[j.mood_type as keyof typeof MOOD_TYPES]
            const bg = j.mood_type === 'happy' || j.mood_type === 'excited'
              ? 'bg-yellow-50'
              : j.mood_type === 'calm'
              ? 'bg-blue-50'
              : j.mood_type === 'sad'
              ? 'bg-gray-50'
              : j.mood_type === 'angry'
              ? 'bg-red-50'
              : j.mood_type === 'stressed'
              ? 'bg-purple-50'
              : j.mood_type === 'tired'
              ? 'bg-indigo-50'
              : 'bg-slate-50'
            return (
              <div key={j.id} className={`p-4 rounded-lg border ${bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{mood?.emoji}</span>
                  <span className="font-medium">{mood?.label}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(j.created_at).toLocaleString('tr-TR')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{j.content}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


