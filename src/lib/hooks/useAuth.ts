'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, type User } from '@/lib/supabase'
import { useEffect, useState } from 'react'

// Auth state
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || '',
          created_at: session.user.created_at,
        })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || '',
            created_at: session.user.created_at,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// Sign up
export function useSignUp() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      try {
        // Önce kayıt olmayı dene
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        })
        
        if (error) {
          // Eğer kullanıcı zaten varsa, giriş yapmayı dene
          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })
            
            if (signInError) throw signInError
            return signInData
          }
          throw error
        }
        
        // Kayıt başarılıysa, kullanıcıyı otomatik giriş yap
        if (data.user && !data.user.email_confirmed_at) {
          // Email doğrulanmamışsa, otomatik giriş yap
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (signInError) {
            // Giriş başarısızsa, kullanıcıya email doğrulama mesajı göster
            return data
          }
          
          return signInData
        }
        
        return data
      } catch (error: any) {
        // Email doğrulama hatası varsa, kullanıcıyı bilgilendir
        if (error.message.includes('Email address') || error.message.includes('invalid')) {
          throw new Error('Bu email adresi kabul edilmiyor. Lütfen farklı bir email adresi deneyin.')
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

// Sign in
export function useSignIn() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

// Sign out
export function useSignOut() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.clear() // Clear all cached data
    },
  })
}
