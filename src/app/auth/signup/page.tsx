'use client'

import { useState } from 'react'
import { useSignUp } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const signUp = useSignUp()
  const router = useRouter()

  const validateEmail = (email: string) => {
    // Çok esnek email validasyonu - herhangi bir format kabul et
    return email.trim().length > 0 && email.includes('@')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    
    if (!name.trim()) {
      setErrorMessage('Ad Soyad alanı boş olamaz!')
      return
    }
    
    if (!validateEmail(email)) {
      setErrorMessage('Geçerli bir email adresi girin!')
      return
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Şifreler eşleşmiyor!')
      return
    }
    
    if (password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır!')
      return
    }
    
    try {
      await signUp.mutateAsync({ email, password, name })
      // Başarılı kayıt sonrası dashboard'a yönlendir
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Sign up error:', error)
      
      // Supabase hata mesajlarını Türkçe'ye çevir
      if (error?.message?.includes('password')) {
        setErrorMessage('Şifre çok zayıf. Daha güçlü bir şifre seçin.')
      } else if (error?.message?.includes('already registered')) {
        setErrorMessage('Bu email adresi zaten kayıtlı. Giriş yapmayı deneyin.')
      } else {
        setErrorMessage(`Kayıt başarısız: ${error?.message || 'Bilinmeyen hata'}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-8">
      <div className="max-w-md mx-auto mt-20">
        <Card className="bg-white/90 backdrop-blur-md border-green-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">✨</div>
            <CardTitle className="text-2xl text-gray-900">Kayıt Ol</CardTitle>
            <CardDescription className="text-gray-600">
              Yeni hesap oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Ad Soyad</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Adınız Soyadınız"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white border-green-200 text-gray-900 placeholder:text-gray-500 focus:border-green-400 focus:ring-green-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="test@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-green-200 text-gray-900 placeholder:text-gray-500 focus:border-green-400 focus:ring-green-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white border-green-200 text-gray-900 placeholder:text-gray-500 focus:border-green-400 focus:ring-green-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white border-green-200 text-gray-900 placeholder:text-gray-500 focus:border-green-400 focus:ring-green-400"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                disabled={signUp.isPending}
              >
                {signUp.isPending ? 'Kayıt oluşturuluyor...' : '✨ Kayıt Ol'}
              </Button>

              {(signUp.isError || errorMessage) && (
                <p className="text-red-500 text-sm text-center">
                  {errorMessage || 'Kayıt başarısız. Lütfen tekrar deneyin.'}
                </p>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <Link href="/auth/signin" className="text-green-600 hover:text-green-500 hover:underline">
                  🚀 Giriş yapın
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
