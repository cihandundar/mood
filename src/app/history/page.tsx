"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import { PastDaysGrid, DayDetailModal } from '@/components/dashboard/past-days'

export default function HistoryPage() {
  const { user } = useAuth()
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<string | null>(null)

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
          <h1 className="text-3xl font-bold">Geçmiş Günler</h1>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Geçmiş Günler</CardTitle>
            <CardDescription>Mood kaydı olan günlerin özetleri</CardDescription>
          </CardHeader>
          <CardContent>
            <PastDaysGrid userId={user.id} onSelectDay={setSelectedDayForDetail} />
          </CardContent>
        </Card>

        {selectedDayForDetail && (
          <DayDetailModal
            date={selectedDayForDetail}
            userId={user.id}
            onClose={() => setSelectedDayForDetail(null)}
          />
        )}
      </div>
    </div>
  )
}


