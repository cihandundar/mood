'use client'

import { useAuth, useSignOut } from '@/lib/hooks/useAuth'
import { useDailySummary, useMoodHistory, MOOD_TYPES } from '@/lib/hooks/useMood'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const { user } = useAuth()
  const signOut = useSignOut()
  const today = new Date().toISOString().split('T')[0]
  const { data: dailySummary } = useDailySummary(user?.id || '', today)
  const { data: moodHistory } = useMoodHistory(user?.id || '', 7)
  const [selectedDate, setSelectedDate] = useState(today)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Giriş yapmanız gerekiyor</p>
          <Link href="/auth/signin">
            <Button className="mt-4">Giriş Yap</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getMoodInsight = (dominantMood: string) => {
    const insights = {
      happy: 'Bugün çok mutlusunuz! 😊',
      excited: 'Bugün heyecanlısınız! 🤩',
      calm: 'Bugün sakin ve huzurlusunuz! 😌',
      sad: 'Bugün biraz üzgünsünüz. Size destek olacak birini arayın. 😢',
      angry: 'Bugün kızgınsınız. Derin nefes alın ve sakinleşin. 😠',
      stressed: 'Bugün streslisiniz. Biraz dinlenmeye çalışın. 😰',
      tired: 'Bugün yorgunsunuz. Erken uyumayı düşünün. 😴',
      neutral: 'Bugün nötr hissediyorsunuz. 😐',
    }
    return insights[dominantMood as keyof typeof insights] || 'Bugünkü ruh haliniz analiz ediliyor...'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Ruh halinizin analizi
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Ana Sayfa</Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
            >
              {signOut.isPending ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
            </Button>
          </div>
        </div>

        {/* Today's Summary */}
        {dailySummary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Bugünkü Özet</CardTitle>
              <CardDescription>
                {dailySummary.total_entries} mood kaydı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dominant Mood */}
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {MOOD_TYPES[dailySummary.dominant_mood as keyof typeof MOOD_TYPES]?.emoji || '😐'}
                  </div>
                  <h3 className="font-semibold">
                    {MOOD_TYPES[dailySummary.dominant_mood as keyof typeof MOOD_TYPES]?.label || dailySummary.dominant_mood}
                  </h3>
                  <p className="text-sm text-gray-600">Baskın Ruh Hali</p>
                </div>

                {/* Average Intensity */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {dailySummary.average_intensity.toFixed(1)}
                  </div>
                  <h3 className="font-semibold">Ortalama Yoğunluk</h3>
                  <p className="text-sm text-gray-600">/10</p>
                </div>

                {/* Total Entries */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {dailySummary.total_entries}
                  </div>
                  <h3 className="font-semibold">Toplam Kayıt</h3>
                  <p className="text-sm text-gray-600">Bugün</p>
                </div>
              </div>

              {/* Mood Insight */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-center text-blue-800 dark:text-blue-200">
                  {getMoodInsight(dailySummary.dominant_mood)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood Distribution */}
        {dailySummary && dailySummary.mood_distribution && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ruh Hali Dağılımı</CardTitle>
              <CardDescription>
                Bugünkü mood kayıtlarınızın dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(dailySummary.mood_distribution).map(([mood, count]) => {
                  const percentage = (count / dailySummary.total_entries) * 100
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
        )}

        {/* Recent History */}
        {moodHistory && moodHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Son Kayıtlar</CardTitle>
              <CardDescription>
                Son 7 günün mood kayıtları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {moodHistory.slice(0, 10).map((mood, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {MOOD_TYPES[mood.mood_type as keyof typeof MOOD_TYPES]?.emoji}
                      </span>
                      <div>
                        <p className="font-medium">
                          {MOOD_TYPES[mood.mood_type as keyof typeof MOOD_TYPES]?.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(mood.created_at).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      Yoğunluk: {mood.intensity}/10
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
