"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { MoodCharts } from '@/components/charts/mood-charts'

export default function InsightsPage() {
  const { user } = useAuth()
  const [weeklyDays, setWeeklyDays] = useState(7)
  const [yearlyDays, setYearlyDays] = useState(365)

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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">İçgörüler</h1>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Haftalık gösterim:</span>
            <select
              className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900"
              value={weeklyDays}
              onChange={(e) => setWeeklyDays(Number(e.target.value))}
            >
              <option value={7}>7 gün</option>
              <option value={14}>14 gün</option>
              <option value={30}>30 gün</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Dağılım penceresi:</span>
            <select
              className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900"
              value={yearlyDays}
              onChange={(e) => setYearlyDays(Number(e.target.value))}
            >
              <option value={90}>90 gün</option>
              <option value={180}>180 gün</option>
              <option value={365}>365 gün</option>
            </select>
          </div>
        </div>

        <MoodCharts userId={user.id} weeklyDays={weeklyDays} yearlyDays={yearlyDays} />
      </div>
    </div>
  )
}


