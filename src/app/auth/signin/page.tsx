'use client'

import { useState } from 'react'
import { useSignIn } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const signIn = useSignIn()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await signIn.mutateAsync({ email, password })
      router.push('/')
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-8">
      <div className="max-w-md mx-auto mt-20">
        <Card className="bg-white/90 backdrop-blur-md border-green-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🌟</div>
            <CardTitle className="text-2xl text-gray-900">Giriş Yap</CardTitle>
            <CardDescription className="text-gray-600">
              Hesabınıza giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
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
                  className="bg-white border-green-200 text-gray-900 placeholder:text-gray-500 focus:border-green-400 focus:ring-green-400"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                disabled={signIn.isPending}
              >
                {signIn.isPending ? 'Giriş yapılıyor...' : '🚀 Giriş Yap'}
              </Button>

              {signIn.isError && (
                <p className="text-red-500 text-sm text-center">
                  Giriş başarısız. Email ve şifrenizi kontrol edin.
                </p>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link href="/auth/signup" className="text-green-600 hover:text-green-500 hover:underline">
                  ✨ Kayıt olun
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
