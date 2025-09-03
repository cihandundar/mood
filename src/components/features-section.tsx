'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function FeaturesSection() {
  const features = [
    {
      icon: '🧠',
      title: 'Psikolojik Analiz',
      description: 'Ruh halinizin derinlemesine analizi ile kendinizi daha iyi tanıyın',
      benefits: ['Duygu trendleri', 'Stres analizi', 'Mood paterni']
    },
    {
      icon: '📊',
      title: 'Detaylı Raporlar',
      description: 'Günlük, haftalık ve aylık mood raporları ile ilerlemenizi takip edin',
      benefits: ['Görsel grafikler', 'İstatistikler', 'Karşılaştırmalar']
    },
    {
      icon: '🧘‍♀️',
      title: 'Mindfulness Egzersizleri',
      description: 'Ruh sağlığınızı destekleyen meditasyon ve nefes egzersizleri',
      benefits: ['Günlük meditasyon', 'Nefes teknikleri', 'Farkındalık ipuçları']
    },
    {
      icon: '🎯',
      title: 'Kişiselleştirilmiş Hedefler',
      description: 'Ruh sağlığınızı iyileştirmek için özel hedefler belirleyin',
      benefits: ['Hedef takibi', 'Başarı kutlamaları', 'Motivasyon']
    },
    {
      icon: '🔔',
      title: 'Akıllı Hatırlatıcılar',
      description: 'Mood kayıtlarınızı unutmamak için özelleştirilebilir hatırlatıcılar',
      benefits: ['Özelleştirilebilir', 'Yumuşak hatırlatmalar', 'Esnek zamanlama']
    },
    {
      icon: '🤝',
      title: 'Topluluk Desteği',
      description: 'Benzer deneyimleri paylaşan kullanıcılarla bağlantı kurun',
      benefits: ['Anonim paylaşım', 'Destek grupları', 'Motivasyon mesajları']
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Neden Mood Tracker?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Psikoloji destekli özelliklerimizle ruh sağlığınızı takip edin ve iyileştirin
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <CardHeader className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <CardTitle className="text-xl text-gray-900">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-4">
              Hemen Başlayın!
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Ruh sağlığınızı takip etmeye bugün başlayın ve daha mutlu bir yaşam için ilk adımı atın.
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                ✨ Ücretsiz
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                🔒 Güvenli
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                📱 Mobil Uyumlu
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
