'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-8">
      <div className="max-w-6xl mx-auto mt-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Sol Taraf - Uygulama Tanıtımı */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🧠</span>
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Ruh Halinizi <span className="text-green-600">Keşfedin</span>
                </h1>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed">
                Günlük duygu durumunuzu kaydedin, analiz edin ve ruh sağlığınızı iyileştirin. 
                Psikoloji destekli Mood Tracker ile kendinizi daha iyi tanıyın.
              </p>
              
              {/* Emoji Mood Preview */}
              <div className="flex gap-4 mt-6">
                <div className="text-4xl animate-bounce">😊</div>
                <div className="text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>😌</div>
                <div className="text-4xl animate-bounce" style={{animationDelay: '0.4s'}}>🤩</div>
                <div className="text-4xl animate-bounce" style={{animationDelay: '0.6s'}}>😴</div>
              </div>
            </div>

            {/* Özellikler */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Neden Mood Tracker?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white/80 rounded-lg border border-green-200 hover:border-green-400 transition-all shadow-sm">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Psikolojik Analiz</h4>
                    <p className="text-sm text-gray-600">Ruh halinizin trendlerini görün</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white/80 rounded-lg border border-green-200 hover:border-green-400 transition-all shadow-sm">
                  <div className="text-2xl">🧘‍♀️</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Mindfulness</h4>
                    <p className="text-sm text-gray-600">Farkındalıkla yaşayın</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white/80 rounded-lg border border-green-200 hover:border-green-400 transition-all shadow-sm">
                  <div className="text-2xl">📱</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Her Yerden Erişim</h4>
                    <p className="text-sm text-gray-600">Mobil uyumlu tasarım</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white/80 rounded-lg border border-green-200 hover:border-green-400 transition-all shadow-sm">
                  <div className="text-2xl">🔒</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Güvenli & Özel</h4>
                    <p className="text-sm text-gray-600">Verileriniz güvende</p>
                  </div>
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600">1000+</div>
                <div className="text-sm text-gray-600">Mutlu Kullanıcı</div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600">50K+</div>
                <div className="text-sm text-gray-600">Mood Kaydı</div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600">4.8★</div>
                <div className="text-sm text-gray-600">Kullanıcı Puanı</div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Giriş Formu */}
          <div className="flex justify-center">
            <Card className="bg-white/90 border-green-300 backdrop-blur-sm w-full max-w-md shadow-xl">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🌟</div>
                <CardTitle className="text-2xl text-gray-900">Mood Tracker</CardTitle>
                <CardDescription className="text-gray-600">
                  Hesabınıza giriş yapın veya yeni hesap oluşturun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/auth/signin">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 mb-3">
                    🚀 Giriş Yap
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full border-green-300 text-gray-700 hover:bg-green-50 hover:text-gray-900 font-semibold py-3">
                    ✨ Kayıt Ol
                  </Button>
                </Link>
                
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
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
