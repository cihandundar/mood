import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface MoodEntry {
  id: string
  user_id: string
  mood_type: string
  emoji: string
  intensity: number
  notes?: string
  created_at: string
}

export interface DailyMoodSummary {
  date: string
  total_entries: number
  mood_distribution: {
    [key: string]: number
  }
  dominant_mood: string
  average_intensity: number
}
