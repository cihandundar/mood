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
      const { data: result, error } = await supabase
        .from('mood_entries')
        .insert([data])
        .select()
        .single()
      
      if (error) throw error
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
