"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MOOD_TYPES, formatDateForDisplay, useMoodSummaryByDate } from '@/lib/hooks/useMood'
import { supabase, type MoodEntry } from '@/lib/supabase'
import { useJournalsByDate } from '@/lib/hooks/useJournal'

export function PastDaysGrid({ userId, onSelectDay }: { userId: string; onSelectDay: (date: string) => void }) {
  const [daysWithData, setDaysWithData] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkDaysWithData = async () => {
      setIsLoading(true)
      const days: string[] = []

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
    if (userId) checkDaysWithData()
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
        <PastDayCard key={date} date={date} userId={userId} onSelect={() => onSelectDay(date)} />
      ))}
    </div>
  )
}

export function PastDayCard({ date, userId, onSelect, showOnlyWithData = false }: { date: string; userId: string; onSelect: () => void; showOnlyWithData?: boolean }) {
  const { data: summary } = useMoodSummaryByDate(userId, date)
  const { data: journals } = useJournalsByDate(userId, date)
  const checkIns = useMemo(() => {
    if (!summary?.moods) return [] as Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }>
    const items: Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }> = []
    const moods = Array.isArray(summary?.moods) ? (summary.moods as MoodEntry[]) : []
    for (const m of moods) {
      const notes = typeof m.notes === 'string' ? m.notes : ''
      if (!notes) continue
      for (const line of notes.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('checkin:')) {
          const jsonPart = trimmed.slice('checkin:'.length).trim()
          try {
            const data = JSON.parse(jsonPart) as { stressLevel?: number; energyLevel?: number; sleepHours?: number }
            items.push({ timestamp: m.created_at, ...data })
          } catch {}
        }
      }
    }
    return items
  }, [summary])

  if (!summary && showOnlyWithData) {
    return null
  }
  if (!summary) {
    return (
      <Card className="p-4 border-dashed border-gray-300 bg-gray-50/80 backdrop-blur-sm cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 sm:hover:scale-105" onClick={onSelect}>
        <div className="text-center">
          <div className="text-3xl mb-3 transform transition-transform duration-300 sm:hover:scale-125">📅</div>
          <h3 className="font-bold text-gray-700 text-lg mb-2">{formatDateForDisplay(date)}</h3>
          <p className="text-sm text-gray-500 font-medium">Kayıt yok</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 sm:hover:scale-110 border-2 border-gray-200 hover:border-green-300 bg-white/90 backdrop-blur-sm" onClick={onSelect}>
      <div className="text-center">
        <div className="text-4xl mb-3 transform transition-transform duration-300 sm:hover:scale-125">
          {MOOD_TYPES[summary.mostFrequentMood as keyof typeof MOOD_TYPES]?.emoji || '😐'}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">{formatDateForDisplay(date)}</h3>
        <p className="text-sm text-gray-600 mb-3 font-medium">{summary.totalMoods} kayıt</p>
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
        <p className="text-xs text-gray-500 font-medium">En çok: {MOOD_TYPES[summary.mostFrequentMood as keyof typeof MOOD_TYPES]?.label}</p>
      </div>
    </Card>
  )
}

export function DayDetailModal({ date, userId, onClose }: { date: string; userId: string; onClose: () => void }) {
  const { data: summary } = useMoodSummaryByDate(userId, date)
  const { data: journals } = useJournalsByDate(userId, date)
  const checkIns = useMemo(() => {
    if (!summary?.moods) return [] as Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }>
    const items: Array<{ timestamp: string; stressLevel?: number; energyLevel?: number; sleepHours?: number }> = []
    const moods = Array.isArray(summary?.moods) ? (summary.moods as MoodEntry[]) : []
    for (const m of moods) {
      const notes = typeof m.notes === 'string' ? m.notes : ''
      if (!notes) continue
      for (const line of notes.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('checkin:')) {
          const jsonPart = trimmed.slice('checkin:'.length).trim()
          try {
            const data = JSON.parse(jsonPart) as { stressLevel?: number; energyLevel?: number; sleepHours?: number }
            items.push({ timestamp: m.created_at, ...data })
          } catch {}
        }
      }
    }
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return items
  }, [summary])

  if (!summary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-x-hidden">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-xl font-bold mb-2">{formatDateForDisplay(date)}</h2>
            <p className="text-gray-600 mb-4">Bu güne ait kayıt bulunamadı</p>
            <button className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm" onClick={onClose}>Kapat</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-x-hidden">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{formatDateForDisplay(date)} - Detaylar</h2>
          <button className="inline-flex items-center justify-center rounded-md px-2 py-1 text-sm" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-6">
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

          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <h3 className="font-semibold mb-2">En Çok Seçilen Ruh Hali</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{MOOD_TYPES[summary.mostFrequentMood as keyof typeof MOOD_TYPES]?.emoji}</span>
              <div>
                <div className="font-medium">{MOOD_TYPES[summary.mostFrequentMood as keyof typeof MOOD_TYPES]?.label}</div>
                <div className="text-sm text-gray-600">{summary.mostFrequentCount} kez seçildi</div>
              </div>
            </div>
          </div>

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
                    <div className="w-32 text-right">
                      <span className="text-sm font-medium">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Saatlik Dağılım</h3>
            <div className="space-y-2">
              {summary.moods.map((mood, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{MOOD_TYPES[mood.mood_type as keyof typeof MOOD_TYPES]?.emoji}</span>
                    <span className="text-sm">{MOOD_TYPES[mood.mood_type as keyof typeof MOOD_TYPES]?.label}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(mood.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
            <h3 className="font-semibold mb-3">Check‑in&apos;ler</h3>
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


