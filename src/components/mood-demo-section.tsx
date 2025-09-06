'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

export function MoodDemoSection() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const handleMoodSelect = (moodType: string) => {
    setSelectedMood(moodType)
  }

  const moodTypes = [
    { key: 'happy', emoji: '😊', label: 'Mutlu', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
    { key: 'excited', emoji: '🤩', label: 'Heyecanlı', color: 'bg-pink-100', textColor: 'text-pink-800' },
    { key: 'calm', emoji: '😌', label: 'Sakin', color: 'bg-blue-100', textColor: 'text-blue-800' },
    { key: 'sad', emoji: '😢', label: 'Üzgün', color: 'bg-gray-100', textColor: 'text-gray-800' },
    { key: 'angry', emoji: '😠', label: 'Kızgın', color: 'bg-red-100', textColor: 'text-red-800' },
    { key: 'stressed', emoji: '😰', label: 'Stresli', color: 'bg-orange-100', textColor: 'text-orange-800' },
    { key: 'tired', emoji: '😴', label: 'Yorgun', color: 'bg-purple-100', textColor: 'text-purple-800' },
    { key: 'neutral', emoji: '😐', label: 'Nötr', color: 'bg-slate-100', textColor: 'text-slate-800' }
  ]

  const psychologyTips = {
    happy: {
      tip: 'Mutluluğunuzu sürdürmek için günlük minnettarlık egzersizleri yapın',
      activity: 'Günlük 3 şey için minnettar olduğunuzu yazın',
      emoji: '🙏'
    },
    excited: {
      tip: 'Heyecanınızı yönetmek için derin nefes alın ve sakinleşin',
      activity: '5-5-5 nefes tekniği uygulayın',
      emoji: '🫁'
    },
    calm: {
      tip: 'Sakinliğinizi korumak için mindfulness pratikleri yapın',
      activity: '10 dakika meditasyon yapın',
      emoji: '🧘‍♀️'
    },
    sad: {
      tip: 'Üzüntünüzü kabul edin ve kendinize nazik davranın',
      activity: 'Sevdiğiniz bir aktivite yapın',
      emoji: '💝'
    },
    angry: {
      tip: 'Öfkenizi sağlıklı yollarla ifade edin',
      activity: 'Fiziksel egzersiz yapın veya yazın',
      emoji: '💪'
    },
    stressed: {
      tip: 'Stresinizi azaltmak için gevşeme teknikleri kullanın',
      activity: 'Progressive muscle relaxation yapın',
      emoji: '🌿'
    },
    tired: {
      tip: 'Yorgunluğunuzu dinleyin ve dinlenmeye izin verin',
      activity: 'Kısa bir şekerleme yapın',
      emoji: '😴'
    },
    neutral: {
      tip: 'Nötr hissetmek normaldir, kendinizi kabul edin',
      activity: 'Günlük rutininizi gözden geçirin',
      emoji: '📝'
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Mood Takibi Nasıl Çalışır?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Ruh halinizi seçin, analiz edin ve psikolojik öneriler alın
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Sol Taraf - Mood Seçimi */}
          <div>
            <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                  <span>😊</span>
                  Ruh Halinizi Seçin
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Şu anki duygu durumunuzu seçin ve psikolojik öneriler alın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {moodTypes.map((mood) => (
                    <button
                      key={mood.key}
                      onClick={() => handleMoodSelect(mood.key)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                        selectedMood === mood.key
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{mood.emoji}</div>
                      <div className="font-medium text-gray-900">
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Taraf - Psikolojik Öneriler */}
          <div>
            {selectedMood ? (
              <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <span>{moodTypes.find(m => m.key === selectedMood)?.emoji}</span>
                    Psikolojik Öneriler
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Ruh sağlığınız için uzman önerileri
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">💡</span>
                      <h4 className="font-semibold text-gray-900">Psikoloji İpucu</h4>
                    </div>
                    <p className="text-gray-700">
                      {psychologyTips[selectedMood as keyof typeof psychologyTips].tip}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{psychologyTips[selectedMood as keyof typeof psychologyTips].emoji}</span>
                      <h4 className="font-semibold text-gray-900">Önerilen Aktivite</h4>
                    </div>
                    <p className="text-gray-700">
                      {psychologyTips[selectedMood as keyof typeof psychologyTips].activity}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-sm">
                      🧠 Psikoloji
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      💪 Sağlık
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      🌟 İyileştirme
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <span>🧠</span>
                    Psikolojik Analiz
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Sol taraftan bir ruh hali seçin ve psikolojik öneriler alın
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="text-6xl mb-4">👆</div>
                  <p className="text-gray-600">
                    Ruh halinizi seçmek için sol taraftaki emojilere tıklayın
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-4">
              Her Gün Kendinizi Daha İyi Tanıyın
            </h3>
            <p className="text-lg opacity-90">
              Mood Tracker ile ruh halinizi takip edin, analiz edin ve psikolojik destek alın.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
