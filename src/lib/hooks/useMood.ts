'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, type MoodEntry } from '@/lib/supabase'

// Mood types and emojis
export const MOOD_TYPES = {
  happy: { emoji: '😊', label: 'Mutlu', color: 'bg-yellow-100 text-yellow-800' },
  excited: { emoji: '🤩', label: 'Heyecanlı', color: 'bg-orange-100 text-orange-800' },
  calm: { emoji: '😌', label: 'Sakin', color: 'bg-blue-100 text-blue-800' },
  sad: { emoji: '😢', label: 'Üzgün', color: 'bg-gray-100 text-gray-800' },
  angry: { emoji: '😠', label: 'Kızgın', color: 'bg-red-100 text-red-800' },
  stressed: { emoji: '😰', label: 'Stresli', color: 'bg-purple-100 text-purple-800' },
  tired: { emoji: '😴', label: 'Yorgun', color: 'bg-indigo-100 text-indigo-800' },
  neutral: { emoji: '😐', label: 'Nötr', color: 'bg-slate-100 text-slate-800' },
} as const

export type MoodType = keyof typeof MOOD_TYPES

// Add mood entry
export function useAddMood() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Omit<MoodEntry, 'id' | 'created_at'>) => {
      console.log('Attempting to add mood:', data)
      
      const today = new Date().toISOString().split('T')[0]
      
      // Önce bugün aynı mood tipinde kayıt var mı kontrol et
      const { data: existingMood, error: checkError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', data.user_id)
        .eq('mood_type', data.mood_type)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing mood:', checkError)
        throw checkError
      }
      
      let result
      
      if (existingMood) {
        // Aynı mood tipinde kayıt varsa güncelle
        console.log('Updating existing mood entry:', existingMood.id)
        const { data: updatedMood, error: updateError } = await supabase
          .from('mood_entries')
          .update({
            intensity: data.intensity,
            notes: data.notes,
            created_at: new Date().toISOString()
          })
          .eq('id', existingMood.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating mood:', updateError)
          throw updateError
        }
        
        result = updatedMood
      } else {
        // Yeni kayıt oluştur
        console.log('Creating new mood entry')
        const { data: newMood, error: insertError } = await supabase
          .from('mood_entries')
          .insert([data])
          .select()
          .single()
        
        if (insertError) {
          console.error('Error inserting mood:', insertError)
          throw insertError
        }
        
        result = newMood
      }
      
      console.log('Mood operation completed successfully:', result)
      return result
    },
    onSuccess: () => {
      // Invalidate and refetch mood data
      queryClient.invalidateQueries({ queryKey: ['moods'] })
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] })
    },
  })
}

// Get today's mood entries
export function useTodayMoods(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  
  return useQuery({
    queryKey: ['moods', userId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

// Get daily mood summary
export function useDailySummary(userId: string, date: string) {
  return useQuery({
    queryKey: ['daily-summary', userId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
      
      if (error) throw error
      
      // Calculate summary
      const moodCounts: Record<string, number> = {}
      let totalIntensity = 0
      
      data.forEach(entry => {
        moodCounts[entry.mood_type] = (moodCounts[entry.mood_type] || 0) + 1
        totalIntensity += entry.intensity
      })
      
      const dominantMood = Object.entries(moodCounts).reduce((a, b) => 
        moodCounts[a[0]] > moodCounts[b[0]] ? a : b
      )[0]
      
      return {
        date,
        total_entries: data.length,
        mood_distribution: moodCounts,
        dominant_mood: dominantMood,
        average_intensity: data.length > 0 ? totalIntensity / data.length : 0,
      }
    },
    enabled: !!userId && !!date,
  })
}

// Get mood history
export function useMoodHistory(userId: string, days: number = 7) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  return useQuery({
    queryKey: ['mood-history', userId, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

// Get mood entries for a specific date
export function useMoodsByDate(userId: string, date: string) {
  return useQuery({
    queryKey: ['moods', userId, date],
    queryFn: async () => {
      if (!userId || !date) return []
      
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching moods by date:', error)
        throw error
      }
      
      return data || []
    },
    enabled: !!userId && !!date,
  })
}

// Get mood summary for a specific date
export function useMoodSummaryByDate(userId: string, date: string) {
  return useQuery({
    queryKey: ['mood-summary', userId, date],
    queryFn: async () => {
      if (!userId || !date) return null
      
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching mood summary:', error)
        throw error
      }
      
      if (!data || data.length === 0) return null
      
      // Mood sayılarını hesapla
      const moodCounts: Record<string, number> = {}
      data.forEach(mood => {
        moodCounts[mood.mood_type] = (moodCounts[mood.mood_type] || 0) + 1
      })
      
      // En çok seçilen mood'u bul
      const mostFrequentMood = Object.entries(moodCounts).reduce((a, b) => 
        moodCounts[a[0]] > moodCounts[b[0]] ? a : b
      )
      
      return {
        date,
        totalMoods: data.length,
        moodCounts,
        mostFrequentMood: mostFrequentMood[0],
        mostFrequentCount: mostFrequentMood[1],
        moods: data
      }
    },
    enabled: !!userId && !!date,
  })
}

// Utility function to get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

// Utility function to get yesterday's date
export function getYesterdayDate(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

// Utility function to format date for display
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
