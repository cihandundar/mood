"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMoodHistory, MOOD_TYPES, type MoodType } from '@/lib/hooks/useMood'
import { memo, useMemo } from 'react'

type Props = {
  userId: string
}

type MoodEntryLike = {
  mood_type: string
  intensity: number
  created_at: string
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getLastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(getDateKey(d))
  }
  return days
}

function aggregateDailyAverage(entries: MoodEntryLike[], days: number) {
  const keys = getLastNDays(days)
  const map: Record<string, { sum: number; count: number }> = {}
  for (const k of keys) map[k] = { sum: 0, count: 0 }

  for (const e of entries) {
    const day = e.created_at.substring(0, 10)
    if (day in map) {
      map[day].sum += Number(e.intensity) || 0
      map[day].count += 1
    }
  }

  return keys.map((k) => ({
    day: k.slice(5),
    average: map[k].count > 0 ? Number((map[k].sum / map[k].count).toFixed(2)) : 0,
  }))
}

function aggregateMoodDistribution(entries: MoodEntryLike[]) {
  const counts: Record<MoodType, number> = {
    happy: 0,
    excited: 0,
    calm: 0,
    sad: 0,
    angry: 0,
    stressed: 0,
    tired: 0,
    neutral: 0,
  }
  for (const e of entries) {
    const t = e.mood_type as MoodType
    if (t in counts) counts[t] += 1
  }
  return (Object.keys(counts) as MoodType[]).map((k) => ({
    mood: MOOD_TYPES[k].label,
    value: counts[k],
  }))
}

const avgTooltipFormatter: NonNullable<TooltipProps<number, string>['formatter']> = (
  value,
) => [
  `${value}/10`,
  'Ortalama',
]

const countTooltipFormatter: NonNullable<TooltipProps<number, string>['formatter']> = (
  value,
) => [
  `${value}`,
  'Adet',
]

function MoodChartsComponent({ userId }: Props) {
  const weekly = useMoodHistory(userId, 7)
  const yearly = useMoodHistory(userId, 365)

  const weeklyAvg = useMemo(() => aggregateDailyAverage(weekly.data || [], 7), [weekly.data])
  const yearlyDistribution = useMemo(() => aggregateMoodDistribution(yearly.data || []), [yearly.data])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
      <Card>
        <CardHeader>
          <CardTitle>Haftalık Ruh Hali (Ortalama Yoğunluk)</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyAvg} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 10]} />
              <ReTooltip formatter={avgTooltipFormatter} labelFormatter={(l) => `Gün: ${l}`} />
              <Line type="monotone" dataKey="average" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yıllık Mood Dağılımı</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={yearlyDistribution}>
              <PolarGrid />
              <PolarAngleAxis dataKey="mood" />
              <PolarRadiusAxis tick={false} />
              <Radar name="Seçimler" dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.4} />
              <Legend />
              <ReTooltip formatter={countTooltipFormatter} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Removed Haftalık Kayıt Sayısı (BarChart) per request */}
    </div>
  )
}

export const MoodCharts = memo(MoodChartsComponent, (prev, next) => prev.userId === next.userId)


