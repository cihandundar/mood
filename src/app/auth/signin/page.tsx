'use client'

import { useSignIn } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-md mx-auto mt-20">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                      <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Giriş Yap</CardTitle>
              <CardDescription className="text-slate-200">
                Hesabınıza giriş yapın
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                             <div className="space-y-2">
                 <Label htmlFor="email" className="text-white">Email</Label>
                 <Input
                   id="email"
                   type="email"
                   placeholder="ornek@email.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="bg-white/20 border-white/30 text-white placeholder:text-slate-300 focus:bg-white/30"
                 />
               </div>
              
                             <div className="space-y-2">
                 <Label htmlFor="password" className="text-white">Şifre</Label>
                 <Input
                   id="password"
                   type="password"
                   placeholder="••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="bg-white/20 border-white/30 text-white placeholder:text-slate-300 focus:bg-white/30"
                 />
               </div>

                             <Button 
                 type="submit" 
                 className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
                 disabled={signIn.isPending}
               >
                 {signIn.isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
               </Button>

              {signIn.isError && (
                <p className="text-red-500 text-sm text-center">
                  Giriş başarısız. Email ve şifrenizi kontrol edin.
                </p>
              )}
            </form>

                         <div className="mt-6 text-center">
               <p className="text-sm text-slate-300">
                 Hesabınız yok mu?{' '}
                 <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 hover:underline">
                   Kayıt olun
                 </Link>
               </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
