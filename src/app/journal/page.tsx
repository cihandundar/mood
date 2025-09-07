"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import { useJournalList, type JournalEntry } from '@/lib/hooks/useJournal'
import { MOOD_TYPES } from '@/lib/hooks/useMood'

export default function JournalPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState<string>('')
  const { data: journals } = useJournalList(user?.id || '', 100)

  const filtered = useMemo(() => {
    const list = Array.isArray(journals) ? (journals as JournalEntry[]) : []
    return list.filter((j) => {
      const matchesQuery = query.trim().length === 0 || j.content.toLowerCase().includes(query.toLowerCase())
      const matchesMood = moodFilter === '' || j.mood_type === moodFilter
      return matchesQuery && matchesMood
    })
  }, [journals, query, moodFilter])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Günlük</h1>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 items-center mb-4">
          <input
            className="border rounded px-3 py-2 text-sm flex-1 min-w-[220px] bg-white dark:bg-gray-900"
            placeholder="Ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900"
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
          >
            <option value="">Tümü</option>
            {Object.keys(MOOD_TYPES).map((k) => (
              <option key={k} value={k}>{MOOD_TYPES[k as keyof typeof MOOD_TYPES].label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((j) => {
            const mood = MOOD_TYPES[j.mood_type as keyof typeof MOOD_TYPES]
            return (
              <Card key={j.id} className="bg-white/90">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-xl">{mood?.emoji}</span>
                    <span>{mood?.label}</span>
                    <span className="ml-auto text-xs text-gray-500">{new Date(j.created_at).toLocaleString('tr-TR')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{j.content}</p>
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-500">Kayıt bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  )
}


