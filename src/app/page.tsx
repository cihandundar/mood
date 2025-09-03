'use client'

import { useAuth, useSignOut } from '@/lib/hooks/useAuth'
import { useAddMood, useTodayMoods, MOOD_TYPES } from '@/lib/hooks/useMood'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  const { user, loading } = useAuth()
  const addMood = useAddMood()
  const signOut = useSignOut()
  const { data: todayMoods } = useTodayMoods(user?.id || '')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(5)

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
    } catch (error) {
      console.error('Error adding mood:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto mt-10">
          <div className="flex justify-end mb-8">
            <ThemeToggle />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Sol Taraf - Uygulama Tanıtımı */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-white leading-tight">
                  Ruh Halinizi <span className="text-purple-400">Takip Edin</span>
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Günlük duygu durumunuzu kaydedin, analiz edin ve ruh sağlığınızı iyileştirin. 
                  Mood Tracker ile kendinizi daha iyi tanıyın.
                </p>
              </div>

              {/* Özellikler */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white mb-4">Özellikler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h4 className="font-medium text-white">Detaylı Analiz</h4>
                      <p className="text-sm text-slate-400">Ruh halinizin trendlerini görün</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h4 className="font-medium text-white">Kolay Kullanım</h4>
                      <p className="text-sm text-slate-400">Tek tıkla ruh halinizi kaydedin</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-2xl">📱</div>
                    <div>
                      <h4 className="font-medium text-white">Mobil Uyumlu</h4>
                      <p className="text-sm text-slate-400">Her cihazdan erişim</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-2xl">🔒</div>
                    <div>
                      <h4 className="font-medium text-white">Güvenli</h4>
                      <p className="text-sm text-slate-400">Verileriniz güvende</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* İstatistikler */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">1000+</div>
                  <div className="text-sm text-slate-400">Aktif Kullanıcı</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">50K+</div>
                  <div className="text-sm text-slate-400">Kayıt</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">4.8★</div>
                  <div className="text-sm text-slate-400">Kullanıcı Puanı</div>
                </div>
              </div>
            </div>

            {/* Sağ Taraf - Giriş Formu */}
            <div className="flex justify-center">
              <Card className="bg-slate-800/50 border-purple-700 backdrop-blur-sm w-full max-w-md">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-white">Mood Tracker</CardTitle>
                  <CardDescription className="text-slate-300">
                    Hesabınıza giriş yapın veya yeni hesap oluşturun
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/auth/signin">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 mb-3 rast">
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 font-semibold py-3">
                      Kayıt Ol
                    </Button>
                  </Link>
                  
                  <div className="text-center pt-4">
                    <p className="text-sm text-slate-400">
                      Ücretsiz hesap oluşturun ve hemen başlayın
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              Merhaba, {user.name || 'Kullanıcı'}! 👋
            </h1>
            <p className="text-lg text-slate-300">
              Bugün nasıl hissediyorsun?
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Mood Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ruh Halinizi Seçin</CardTitle>
            <CardDescription>
              Şu anki duygu durumunuzu seçin ve yoğunluğunu ayarlayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Intensity Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
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
              {Object.entries(MOOD_TYPES).map(([key, mood]) => (
                <Button
                  key={key}
                  variant="outline"
                  className={`h-24 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${
                    selectedMood === key ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleMoodSelect(key)}
                  disabled={addMood.isPending}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </Button>
              ))}
            </div>

            {addMood.isPending && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Kaydediliyor...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Summary */}
        {todayMoods && todayMoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bugünkü Özet</CardTitle>
              <CardDescription>
                Bugün {todayMoods.length} kez ruh halinizi kaydettiniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {todayMoods.map((mood, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {mood.emoji} {MOOD_TYPES[mood.mood_type as keyof typeof MOOD_TYPES]?.label || mood.mood_type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
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
    </div>
  )
}
