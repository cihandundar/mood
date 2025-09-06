'use client'

import { useAuth, useSignOut } from '@/lib/hooks/useAuth'
import { useDailySummary, useMoodHistory, useMoodSummaryByDate, getTodayDate, getYesterdayDate, formatDateForDisplay, MOOD_TYPES, useSaveCheckIn } from '@/lib/hooks/useMood'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MoodCharts } from '@/components/charts/mood-charts'
import { useAddJournal, useJournalList, useJournalsByDate } from '@/lib/hooks/useJournal'
import { CheckInModal, type CheckInData } from '@/components/checkin-modal'

export default function Dashboard() {
  const { user } = useAuth()
  const signOut = useSignOut()
  const saveCheckIn = useSaveCheckIn()
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
  const addJournal = useAddJournal()
  const { data: journals } = useJournalList(user?.id || '', 6)
  const [isJournalOpen, setIsJournalOpen] = useState(false)
  const [journalMood, setJournalMood] = useState<string>('neutral')
  const [journalText, setJournalText] = useState('')
  const checkIns = useMemo(() => {
    if (!moodHistory) return [] as Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }>
    const items: Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }> = []
    for (const m of moodHistory) {
      const notes = typeof (m as any).notes === 'string' ? (m as any).notes as string : ''
      if (!notes) continue
      for (const line of notes.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('checkin:')) {
          const jsonPart = trimmed.slice('checkin:'.length).trim()
          try {
            const data = JSON.parse(jsonPart) as { stressLevel?: number; energyLevel?: number; sleepHours?: number }
            items.push({ timestamp: (m as any).created_at as string, ...data })
          } catch (_) {
            // ignore parse errors
          }
        }
      }
    }
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return items
  }, [moodHistory])
  const groupedDays = useMemo(() => {
    if (!moodHistory) return [] as Array<{ date: string; count: number; items: { emoji: string; label: string; count: number }[] }>
    const dateToCounts: Record<string, Record<string, number>> = {}
    for (const m of moodHistory) {
      const d = new Date((m as { created_at: string }).created_at).toISOString().split('T')[0]
      const type = (m as { mood_type: string }).mood_type
      if (!dateToCounts[d]) dateToCounts[d] = {}
      dateToCounts[d][type] = (dateToCounts[d][type] || 0) + 1
    }
    const result = Object.entries(dateToCounts).map(([date, counts]) => {
      const items = Object.entries(counts)
        .map(([type, count]) => ({
          emoji: MOOD_TYPES[type as keyof typeof MOOD_TYPES]?.emoji || '😐',
          label: MOOD_TYPES[type as keyof typeof MOOD_TYPES]?.label || type,
          count,
        }))
        .sort((a, b) => b.count - a.count)
      const total = items.reduce((acc, it) => acc + it.count, 0)
      return { date, count: total, items }
    })
    return result.sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [moodHistory])
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [openDates, setOpenDates] = useState<Record<string, boolean>>({})
  const handleCheckInSave = async (data: CheckInData) => {
    if (!user?.id) return
    try {
      await saveCheckIn.mutateAsync({ userId: user.id, data })
    } catch (e) {
      console.error('Check-in save failed:', e)
    }
  }

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Ruh halinizin analizi
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">Ana Sayfa</Button>
            </Link>
            <Button variant="outline" onClick={() => setIsCheckInOpen(true)} className="w-full sm:w-auto">
              Kısa Check‑in
            </Button>
            <Button variant="outline" onClick={() => setIsJournalOpen(true)} className="w-full sm:w-auto">
              Hatıra Günlüğü
            </Button>
            <Button 
              variant="outline" 
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              {signOut.isPending ? 'Çıkış yapılıyor...' : '🚪 Çıkış Yap'}
            </Button>
          </div>
        </div>
        {isCheckInOpen && (
          <CheckInModal
            open={isCheckInOpen}
            onClose={() => setIsCheckInOpen(false)}
            onSave={handleCheckInSave}
          />
        )}

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

        {/* Günlük (Journal) Son Kayıtlar */}
        {journals && journals.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Günlük Notlar</CardTitle>
              <CardDescription>Son notlarınız</CardDescription>
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
        )}

        {/* Check-in Kayıtları */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Check‑in Kayıtları</CardTitle>
            <CardDescription>Son 7 günden elde edilen kısa check‑in verileri</CardDescription>
          </CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz check‑in kaydı bulunamadı.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checkIns.slice(0, 9).map((c, idx) => (
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

        {/* Recent History */}
        {groupedDays.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Son Kayıtlar</CardTitle>
              <CardDescription>Son 7 gün - gün bazlı özet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupedDays.map((g) => (
                  <div key={g.date} className="border rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setOpenDates((s) => ({ ...s, [g.date]: !s[g.date] }))}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {new Date(g.date).toLocaleDateString('tr-TR')}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {g.count} kayıt
                        </Badge>
                      </div>
                      <span className={`text-xl md:text-2xl transition-transform ${openDates[g.date] ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    <div className={`bg-white px-4 py-3 overflow-hidden transition-all duration-300 ${openDates[g.date] ? 'opacity-100 max-h-64' : 'opacity-0 max-h-0'}`}>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {g.items.map((it) => (
                          <div key={it.label} className="flex flex-col items-center">
                            <div className="relative inline-block">
                              <span className="text-3xl">{it.emoji}</span>
                              <span className="absolute -top-1 -right-2 bg-green-600 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">{it.count}</span>
                            </div>
                            <span className="text-xs text-gray-600 mt-1 text-center">{it.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Journal Modal */}
      {isJournalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Hatıra Günlüğü</h3>
              <Button variant="ghost" onClick={() => setIsJournalOpen(false)}>✕</Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Ruh Hali</label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {Object.entries(MOOD_TYPES).map(([key, mood]) => (
                    <button
                      key={key}
                      className={`border rounded p-2 text-center hover:bg-gray-50 ${journalMood === key ? 'ring-2 ring-emerald-500' : ''}`}
                      onClick={() => setJournalMood(key)}
                    >
                      <div className="text-xl">{mood.emoji}</div>
                      <div className="text-xs mt-1">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Bugün neler hissediyorsun?</label>
                <textarea
                  className="mt-2 w-full min-h-32 rounded-md border p-3 text-sm"
                  placeholder="Duygularını not al..."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsJournalOpen(false)}>Vazgeç</Button>
                <Button
                  onClick={async () => {
                    if (!user?.id || !journalText.trim()) return
                    try {
                      await addJournal.mutateAsync({ user_id: user.id, mood_type: journalMood, content: journalText.trim() })
                      setJournalText('')
                      setJournalMood('neutral')
                      setIsJournalOpen(false)
                    } catch (e) {
                      console.error(e)
                    }
                  }}
                  disabled={addJournal.isPending}
                >
                  {addJournal.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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
          
          let hasData = !error && data && data.length > 0

          // Eğer mood verisi yoksa, journal var mı bak
          if (!hasData) {
            const { data: j, error: jErr } = await supabase
              .from('journal_entries')
              .select('id')
              .eq('user_id', userId)
              .gte('created_at', `${dateString}T00:00:00`)
              .lte('created_at', `${dateString}T23:59:59`)
              .limit(1)
            if (!jErr && j && j.length > 0) {
              hasData = true
            }
          }

          if (hasData) days.push(dateString)
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
  const { data: journals } = useJournalsByDate(userId, date)
  const checkIns = useMemo(() => {
    if (!summary?.moods) return [] as Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }>
    const items: Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }> = []
    for (const m of summary.moods) {
      const notes = typeof (m as any).notes === 'string' ? ((m as any).notes as string) : ''
      if (!notes) continue
      for (const line of notes.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('checkin:')) {
          const jsonPart = trimmed.slice('checkin:'.length).trim()
          try {
            const data = JSON.parse(jsonPart) as { stressLevel?: number; energyLevel?: number; sleepHours?: number }
            items.push({ timestamp: (m as any).created_at as string, ...data })
          } catch (_) {}
        }
      }
    }
    return items
  }, [summary])
  
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
        <div className="flex items-center justify-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">Günlük: {journals?.length || 0}</Badge>
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 border-purple-200">Check‑in: {checkIns.length}</Badge>
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
  const { data: journals } = useJournalsByDate(userId, date)
  const checkIns = useMemo(() => {
    if (!summary?.moods) return [] as Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }>
    const items: Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }> = []
    for (const m of summary.moods) {
      const notes = typeof (m as any).notes === 'string' ? (m as any).notes as string : ''
      if (!notes) continue
      for (const line of notes.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('checkin:')) {
          const jsonPart = trimmed.slice('checkin:'.length).trim()
          try {
            const data = JSON.parse(jsonPart) as { stressLevel?: number; energyLevel?: number; sleepHours?: number }
            items.push({ timestamp: (m as any).created_at as string, ...data })
          } catch (_) {}
        }
      }
    }
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return items
  }, [summary])
  
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

          {/* Günlük Notlar */}
          <div>
            <h3 className="font-semibold mb-3">Günlük Notlar</h3>
            {(!journals || journals.length === 0) && (
              <p className="text-sm text-gray-500">Bu güne ait günlük bulunamadı.</p>
            )}
            {journals && journals.length > 0 && (
              <div className="space-y-3">
                {journals.map((j) => {
                  const mood = MOOD_TYPES[j.mood_type as keyof typeof MOOD_TYPES]
                  return (
                    <div key={j.id} className="p-3 rounded-md border bg-white/80">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{mood?.emoji}</span>
                        <span className="text-sm font-medium">{mood?.label}</span>
                        <span className="text-xs text-gray-500 ml-auto">{new Date(j.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{j.content}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-3">Check‑in'ler</h3>
            {checkIns.length === 0 && (
              <p className="text-sm text-gray-500">Bu güne ait check‑in bulunamadı.</p>
            )}
            {checkIns.length > 0 && (
              <div className="space-y-2">
                {checkIns.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-md border bg-white/80">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>{new Date(c.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span>Stres</span><span>{c.stressLevel ?? '-'} / 10</span></div>
                      <Progress value={(c.stressLevel ?? 0) * 10} className="h-2" />
                      <div className="flex justify-between text-xs"><span>Enerji</span><span>{c.energyLevel ?? '-'} / 10</span></div>
                      <Progress value={(c.energyLevel ?? 0) * 10} className="h-2" />
                      <div className="text-xs text-gray-600">Uyku: {c.sleepHours ?? '-'} saat</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
