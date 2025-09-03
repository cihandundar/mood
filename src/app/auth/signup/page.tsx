'use client'

import { useSignUp } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-md mx-auto mt-20">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                      <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Kayıt Ol</CardTitle>
              <CardDescription className="text-slate-200">
                Yeni hesap oluşturun
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                             <div className="space-y-2">
                 <Label htmlFor="name" className="text-white">Ad Soyad</Label>
                 <Input
                   id="name"
                   type="text"
                   placeholder="Adınız Soyadınız"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   required
                   className="bg-white/20 border-white/30 text-white placeholder:text-slate-300 focus:bg-white/30"
                 />
               </div>

                             <div className="space-y-2">
                 <Label htmlFor="email" className="text-white">Email</Label>
                 <Input
                   id="email"
                   type="text"
                   placeholder="test@email.com"
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
                   minLength={6}
                   className="bg-white/20 border-white/30 text-white placeholder:text-slate-300 focus:bg-white/30"
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="confirmPassword" className="text-white">Şifre Tekrar</Label>
                 <Input
                   id="confirmPassword"
                   type="password"
                   placeholder="••••••••"
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   required
                   className="bg-white/20 border-white/30 text-white placeholder:text-slate-300 focus:bg-white/30"
                 />
               </div>

                             <Button 
                 type="submit" 
                 className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
                 disabled={signUp.isPending}
               >
                 {signUp.isPending ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
               </Button>

              {(signUp.isError || errorMessage) && (
                <p className="text-red-500 text-sm text-center">
                  {errorMessage || 'Kayıt başarısız. Lütfen tekrar deneyin.'}
                </p>
              )}
            </form>

                         <div className="mt-6 text-center">
               <p className="text-sm text-slate-300">
                 Zaten hesabınız var mı?{' '}
                 <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 hover:underline">
                   Giriş yapın
                 </Link>
               </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
