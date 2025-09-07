"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MOOD_TYPES } from '@/lib/hooks/useMood'

type DailySummary = {
  date: string
  total_entries: number
  mood_distribution: Record<string, number>
  dominant_mood: string
  average_intensity: number
}

type Props = {
  summary: DailySummary
}

function getMoodInsight(dominantMood: string) {
  const insights = {
    happy: 'Bugün çok mutlusunuz! 😊',
    excited: 'Bugün heyecanlısınız! 🤩',
    calm: 'Bugün sakin ve huzurlusunuz! 😌',
    sad: 'Bugün biraz üzgünsünüz. Size destek olacak birini arayın. 😢',
    angry: 'Bugün kızgınsınız. Derin nefes alın ve sakinleşin. 😠',
    stressed: 'Bugün streslisiniz. Biraz dinlenmeye çalışın. 😰',
    tired: 'Bugün yorgunsunuz. Erken uyumayı düşünün. 😴',
    neutral: 'Bugün nötr hissediyorsunuz. 😐',
  } as const
  return insights[dominantMood as keyof typeof insights] || 'Bugünkü ruh haliniz analiz ediliyor...'
}

export function DailySummaryCard({ summary }: Props) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Bugünkü Özet</CardTitle>
        <CardDescription>
          {summary.total_entries} mood kaydı
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">
              {MOOD_TYPES[summary.dominant_mood as keyof typeof MOOD_TYPES]?.emoji || '😐'}
            </div>
            <h3 className="font-semibold">
              {MOOD_TYPES[summary.dominant_mood as keyof typeof MOOD_TYPES]?.label || summary.dominant_mood}
            </h3>
            <p className="text-sm text-gray-600">Baskın Ruh Hali</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {summary.average_intensity.toFixed(1)}
            </div>
            <h3 className="font-semibold">Ortalama Yoğunluk</h3>
            <p className="text-sm text-gray-600">/10</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {summary.total_entries}
            </div>
            <h3 className="font-semibold">Toplam Kayıt</h3>
            <p className="text-sm text-gray-600">Bugün</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-center text-blue-800 dark:text-blue-200">
            {getMoodInsight(summary.dominant_mood)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


