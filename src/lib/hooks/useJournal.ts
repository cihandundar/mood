'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type JournalEntry = {
  id: string
  user_id: string
  mood_type: string
  content: string
  created_at: string
}

export function useAddJournal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<JournalEntry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([payload])
        .select()
        .single()
      if (error) throw error
      return data as JournalEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] })
    },
  })
}

export function useJournalList(userId: string, limit = 10) {
  return useQuery({
    queryKey: ['journal', userId, limit],
    queryFn: async () => {
      if (!userId) return [] as JournalEntry[]
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data || []) as JournalEntry[]
    },
    enabled: !!userId,
  })
}

export function useJournalsByDate(userId: string, date: string) {
  return useQuery({
    queryKey: ['journal-by-date', userId, date],
    queryFn: async () => {
      if (!userId || !date) return [] as JournalEntry[]
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data || []) as JournalEntry[]
    },
    enabled: !!userId && !!date,
  })
}


