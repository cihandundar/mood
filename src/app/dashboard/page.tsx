'use client'

import { useAuth, useSignOut } from '@/lib/hooks/useAuth'
import { useDailySummary, useMoodHistory, useMoodSummaryByDate, getTodayDate, getYesterdayDate, formatDateForDisplay, MOOD_TYPES } from '@/lib/hooks/useMood'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MoodCharts } from '@/components/charts/mood-charts'

export default function Dashboard() {
  const { user } = useAuth()
  const signOut = useSignOut()
  const today = getTodayDate()
  const { data: dailySummary } = useDailySummary(user?.id || '', today)
  const { data: moodHistory } = useMoodHistory(user?.id || '', 7)
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<string | null>(null)

  // Son 7 günün özetini al
  const getLast7Days = () => {
    const days = []
    for (let i = 1; i <= 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  const last7Days = getLast7Days()
  const yesterdayDate = getYesterdayDate()
  const { data: yesterdaySummary } = useMoodSummaryByDate(user?.id || '', yesterdayDate)

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

        {/* Geçmiş Günler Özeti */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Geçmiş Günler</CardTitle>
            <CardDescription>
              Mood kaydı olan günlerin özetleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PastDaysGrid userId={user?.id || ''} onSelectDay={setSelectedDayForDetail} />
          </CardContent>
        </Card>

        {/* Gün Detay Modal */}
        {selectedDayForDetail && (
          <DayDetailModal 
            date={selectedDayForDetail}
            userId={user?.id || ''}
            onClose={() => setSelectedDayForDetail(null)}
          />
        )}

        {/* Charts */}
        <MoodCharts userId={user?.id || ''} />

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

// Past Days Grid Component
function PastDaysGrid({ userId, onSelectDay }: { userId: string; onSelectDay: (date: string) => void }) {
  const [daysWithData, setDaysWithData] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Son 30 günü kontrol et ve mood kaydı olanları bul
  useEffect(() => {
    const checkDaysWithData = async () => {
      setIsLoading(true)
      const days = []
      
      // Son 30 günü kontrol et
      for (let i = 1; i <= 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]
        
        try {
          const { data, error } = await supabase
            .from('mood_entries')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', `${dateString}T00:00:00`)
            .lte('created_at', `${dateString}T23:59:59`)
            .limit(1)
          
          if (!error && data && data.length > 0) {
            days.push(dateString)
          }
        } catch (error) {
          console.error('Error checking day:', dateString, error)
        }
      }
      
      setDaysWithData(days)
      setIsLoading(false)
    }

    if (userId) {
      checkDaysWithData()
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (daysWithData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Henüz mood kaydınız yok</h3>
        <p className="text-gray-500">İlk mood kaydınızı oluşturduğunuzda burada görünecek</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {daysWithData.map((date) => (
        <PastDayCard 
          key={date} 
          date={date} 
          userId={userId} 
          onSelect={() => onSelectDay(date)}
        />
      ))}
    </div>
  )
}

// Past Day Card Component
function PastDayCard({ date, userId, onSelect, showOnlyWithData = false }: { date: string; userId: string; onSelect: () => void; showOnlyWithData?: boolean }) {
  const { data: summary } = useMoodSummaryByDate(userId, date)
  
  // Eğer showOnlyWithData true ise ve veri yoksa hiçbir şey gösterme
  if (!summary && showOnlyWithData) {
    return null
  }
  
  if (!summary) {
    return (
      <Card className="p-4 border-dashed border-gray-300 bg-gray-50/80 backdrop-blur-sm cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 hover:scale-105" onClick={onSelect}>
        <div className="text-center">
          <div className="text-3xl mb-3 transform transition-transform duration-300 hover:scale-125">📅</div>
          <h3 className="font-bold text-gray-700 text-lg mb-2">{formatDateForDisplay(date)}</h3>
          <p className="text-sm text-gray-500 font-medium">Kayıt yok</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-110 border-2 border-gray-200 hover:border-green-300 bg-white/90 backdrop-blur-sm" onClick={onSelect}>
      <div className="text-center">
        <div className="text-4xl mb-3 transform transition-transform duration-300 hover:scale-125">
          {MOOD_TYPES[summary.mostFrequentMood as keyof typeof MOOD_TYPES]?.emoji || '😐'}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">{formatDateForDisplay(date)}</h3>
        <p className="text-sm text-gray-600 mb-3 font-medium">
          {summary.totalMoods} kayıt
        </p>
        <div className="flex flex-wrap gap-1 justify-center mb-3">
          {Object.entries(summary.moodCounts).slice(0, 3).map(([moodType, count]) => (
            <Badge key={moodType} variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors">
              {MOOD_TYPES[moodType as keyof typeof MOOD_TYPES]?.emoji} {count}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-gray-500 font-medium">
          En çok: {MOOD_TYPES[summary.mostFrequentMood as keyof typeof MOOD_TYPES]?.label}
        </p>
      </div>
    </Card>
  )
}

// Day Detail Modal Component
function DayDetailModal({ date, userId, onClose }: { date: string; userId: string; onClose: () => void }) {
  const { data: summary } = useMoodSummaryByDate(userId, date)
  
  if (!summary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-xl font-bold mb-2">{formatDateForDisplay(date)}</h2>
            <p className="text-gray-600 mb-4">Bu güne ait kayıt bulunamadı</p>
            <Button onClick={onClose}>Kapat</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{formatDateForDisplay(date)} - Detaylar</h2>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        
        <div className="space-y-6">
          {/* Özet Bilgiler */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.totalMoods}</div>
              <div className="text-sm text-blue-600">Toplam Kayıt</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.mostFrequentCount}</div>
              <div className="text-sm text-green-600">En Çok Seçilen</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(summary.moodCounts).length}</div>
              <div className="text-sm text-purple-600">Farklı Mood</div>
            </div>
          </div>

          {/* En Çok Seçilen Mood */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <h3 className="font-semibold mb-2">En Çok Seçilen Ruh Hali</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {MOOD_TYPES[summary.mostFrequentMood as keyof typeof MOOD_TYPES]?.emoji}
              </span>
              <div>
                <div className="font-medium">
                  {MOOD_TYPES[summary.mostFrequentMood as keyof typeof MOOD_TYPES]?.label}
                </div>
                <div className="text-sm text-gray-600">
                  {summary.mostFrequentCount} kez seçildi
                </div>
              </div>
            </div>
          </div>

          {/* Mood Dağılımı */}
          <div>
            <h3 className="font-semibold mb-3">Mood Dağılımı</h3>
            <div className="space-y-3">
              {Object.entries(summary.moodCounts).map(([moodType, count]) => {
                const percentage = (count / summary.totalMoods) * 100
                const moodInfo = MOOD_TYPES[moodType as keyof typeof MOOD_TYPES]
                
                return (
                  <div key={moodType} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-24">
                      <span className="text-xl">{moodInfo?.emoji}</span>
                      <span className="text-sm font-medium">{moodInfo?.label}</span>
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-medium">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Saatlik Dağılım */}
          <div>
            <h3 className="font-semibold mb-3">Saatlik Dağılım</h3>
            <div className="space-y-2">
              {summary.moods.map((mood, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {MOOD_TYPES[mood.mood_type as keyof typeof MOOD_TYPES]?.emoji}
                    </span>
                    <span className="text-sm">
                      {MOOD_TYPES[mood.mood_type as keyof typeof MOOD_TYPES]?.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(mood.created_at).toLocaleTimeString('tr-TR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
