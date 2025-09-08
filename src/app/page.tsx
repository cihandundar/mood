'use client'

import { useAuth, useSignOut } from '@/lib/hooks/useAuth'
import { useAddMood, useTodayMoods, MOOD_TYPES } from '@/lib/hooks/useMood'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'
import Link from 'next/link'
import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'
import { MoodDemoSection } from '@/components/mood-demo-section'

export default function Home() {
  const { user, loading } = useAuth()
  const addMood = useAddMood()
  const signOut = useSignOut()
  const { data: todayMoods } = useTodayMoods(user?.id || '')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(5)

  // Geçmiş günlerin özetini al

  // Mood sayısını hesapla
  const getMoodCount = (moodType: string) => {
    if (!todayMoods) return 0
    return todayMoods.filter(mood => mood.mood_type === moodType).length
  }

  const handleMoodSelect = async (moodType: string) => {
    if (!user) return
    
    setSelectedMood(moodType)
    
    try {
      await addMood.mutateAsync({
        user_id: user.id,
        mood_type: moodType,
        emoji: MOOD_TYPES[moodType as keyof typeof MOOD_TYPES].emoji,
        intensity,
        notes: '',
      })
      
      setSelectedMood(null)
      setIntensity(5)
    } catch (error: unknown) {
      console.error('Error adding mood:', error)

      let message = 'Bilinmeyen hata'
      let code: string | number | undefined
      let details: unknown
      let hint: unknown

      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
          message = (error as { message: string }).message
        }
        if ('code' in error) code = (error as { code?: unknown }).code as string | number | undefined
        if ('details' in error) details = (error as { details?: unknown }).details
        if ('hint' in error) hint = (error as { hint?: unknown }).hint
      }

      console.error('Error details:', { message, code, details, hint })

      // Kullanıcıya hata mesajı göster
      alert(`Mood kaydedilemedi: ${message}`)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <HeroSection />
        <FeaturesSection />
        <MoodDemoSection />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Merhaba, {user.name || 'Kullanıcı'}! 👋
          </h1>
          <p className="text-lg text-gray-700">
            Bugün nasıl hissediyorsun?
          </p>
        </div>

        {/* Mood Selection */}
        <Card className="mb-8 bg-white/90 border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Ruh Halinizi Seçin</CardTitle>
            <CardDescription className="text-gray-600">
              Şu anki duygu durumunuzu seçin ve yoğunluğunu ayarlayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Intensity Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Yoğunluk: {intensity}/10
              </label>
              <Progress value={intensity * 10} className="mb-2" />
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Mood Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(MOOD_TYPES).map(([key, mood]) => {
                const count = getMoodCount(key)
                return (
                  <Button
                    key={key}
                    variant="outline"
                    className={`h-24 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-110 hover:shadow-lg border-2 border-green-300 hover:border-green-500 relative bg-white/90 backdrop-blur-sm ${
                      selectedMood === key ? 'ring-2 ring-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => handleMoodSelect(key)}
                    disabled={addMood.isPending}
                  >
                    <span className="text-3xl transform transition-transform duration-300 hover:scale-125">{mood.emoji}</span>
                    <span className="text-xs font-medium">{mood.label}</span>
                    {count > 0 && (
                      <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md">
                        {count}
                      </div>
                    )}
                  </Button>
                )
              })}
            </div>

            {addMood.isPending && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Kaydediliyor...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Summary */}
        {todayMoods && todayMoods.length > 0 && (
          <Card className="bg-white/90 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Bugünkü Özet</CardTitle>
              <CardDescription className="text-gray-600">
                Bugün {todayMoods.length} kez ruh halinizi kaydettiniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(MOOD_TYPES).map(([key, mood]) => {
                  const count = getMoodCount(key)
                  if (count > 0) {
                    return (
                      <Badge 
                        key={key} 
                        variant="secondary" 
                        className="text-sm bg-green-100 text-green-800 border-green-200 relative"
                      >
                        {mood.emoji} {mood.label}
                        <span className="ml-1 bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                          {count}
                        </span>
                      </Badge>
                    )
                  }
                  return null
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="border-green-300 text-gray-700 hover:bg-green-50">
              Dashboard
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
          >
            {signOut.isPending ? 'Çıkış yapılıyor...' : '🚪 Çıkış Yap'}
          </Button>
        </div>
      </div>
    </div>
  )
}
