"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type CheckIn = {
  timestamp: string
  stressLevel?: number
  energyLevel?: number
  sleepHours?: number
}

type Props = {
  items: CheckIn[]
}

export function CheckInsSection({ items }: Props) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Check‑in Kayıtları</CardTitle>
        <CardDescription>Son 7 günden elde edilen kısa check‑in verileri</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz check‑in kaydı bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.slice(0, 9).map((c, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-white/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">
                    {new Date(c.timestamp).toLocaleString('tr-TR')}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Uyku: {c.sleepHours ?? '-'}s
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Stres</span>
                      <span>{c.stressLevel ?? '-'} / 10</span>
                    </div>
                    <Progress value={(c.stressLevel ?? 0) * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Enerji</span>
                      <span>{c.energyLevel ?? '-'} / 10</span>
                    </div>
                    <Progress value={(c.energyLevel ?? 0) * 10} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


