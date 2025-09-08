'use client'

import { useAuth, useSignOut } from '@/lib/hooks/useAuth'
import { useDailySummary, useMoodHistory, getTodayDate, MOOD_TYPES, useSaveCheckIn } from '@/lib/hooks/useMood'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { type MoodEntry, type DailyMoodSummary } from '@/lib/supabase'
import { MoodCharts } from '@/components/charts/mood-charts'
import { DailySummaryCard } from '@/components/dashboard/daily-summary-card'
import { MoodDistributionCard } from '@/components/dashboard/mood-distribution-card'
import { JournalsTodayCard } from '@/components/dashboard/journals-today-card'
import { CheckInsSection } from '@/components/dashboard/checkins-section'
import { DayDetailModal, PastDaysGrid } from '@/components/dashboard/past-days'
import { JournalModal } from '@/components/dashboard/journal-modal'
import { useJournalsByDate, type JournalEntry } from '@/lib/hooks/useJournal'
import { CheckInModal, type CheckInData } from '@/components/checkin-modal'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function Dashboard() {
  const { user } = useAuth()
  const signOut = useSignOut()
  const saveCheckIn = useSaveCheckIn()
  const today = getTodayDate()
  const { data: dailySummary } = useDailySummary(user?.id || '', today)
  const { data: moodHistory } = useMoodHistory(user?.id || '', 7)
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<string | null>(null)

  // Son 7 günün özetini al - artık kullanılmıyor (gerekirse insights sayfasına taşınır)
  const { data: journalsToday } = useJournalsByDate(user?.id || '', today)
  const [isJournalOpen, setIsJournalOpen] = useState(false)
  // journal modal local state moved into component
  const checkIns = useMemo(() => {
    if (!moodHistory) return [] as Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }>
    const items: Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }> = []
    const baseHistory = Array.isArray(moodHistory) ? (moodHistory as MoodEntry[]) : []
    for (const m of baseHistory) {
      const notes = typeof m.notes === 'string' ? m.notes : ''
      if (!notes) continue
      for (const line of notes.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('checkin:')) {
          const jsonPart = trimmed.slice('checkin:'.length).trim()
          try {
            const data = JSON.parse(jsonPart) as { stressLevel?: number; energyLevel?: number; sleepHours?: number }
            items.push({ timestamp: m.created_at, ...data })
          } catch {
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

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 overflow-x-hidden">
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
              <Button variant="outline" className="w-full sm:w-auto cursor-pointer">Ana Sayfa</Button>
            </Link>

            <Button variant="outline" onClick={() => setIsCheckInOpen(true)} className="w-full sm:w-auto cursor-pointer">
              Kısa Check‑in
            </Button>
            <Button variant="outline" onClick={() => setIsJournalOpen(true)} className="w-full sm:w-auto cursor-pointer">
              Hatıra Günlüğü
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto cursor-pointer">Detaylar</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/history">Geçmiş Günler</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/insights">İçgörüler</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/journal">Günlük</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 cursor-pointer"
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
        {dailySummary && <DailySummaryCard summary={dailySummary as DailyMoodSummary} />}

        {/* Mood Distribution */}
        {dailySummary && dailySummary.mood_distribution && (
          <MoodDistributionCard summary={dailySummary as DailyMoodSummary} />
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

        {/* Günlük (Journal) - Bugün */}
        {Array.isArray(journalsToday) && journalsToday.length > 0 && (
          <JournalsTodayCard journals={journalsToday as JournalEntry[]} />
        )}

        {/* Check-in Kayıtları */}
        <CheckInsSection items={checkIns} />

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
                              <span className="absolute -top-1 right-0 bg-green-600 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">{it.count}</span>
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
      <JournalModal userId={user.id} open={isJournalOpen} onClose={() => setIsJournalOpen(false)} />
    </div>
  )
}

