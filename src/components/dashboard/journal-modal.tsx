"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MOOD_TYPES } from '@/lib/hooks/useMood'
import { useAddJournal } from '@/lib/hooks/useJournal'

type Props = {
  userId: string
  open: boolean
  onClose: () => void
}

export function JournalModal({ userId, open, onClose }: Props) {
  const addJournal = useAddJournal()
  const [journalMood, setJournalMood] = useState<string>('neutral')
  const [journalText, setJournalText] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Hatıra Günlüğü</h3>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Ruh Hali</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {Object.entries(MOOD_TYPES).map(([key, mood]) => (
                <button
                  key={key}
                  className={`border rounded p-2 text-center hover:bg-gray-50 ${journalMood === key ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => setJournalMood(key)}
                >
                  <div className="text-xl">{mood.emoji}</div>
                  <div className="text-xs mt-1">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Bugün neler hissediyorsun?</label>
            <textarea
              className="mt-2 w-full min-h-32 rounded-md border p-3 text-sm"
              placeholder="Duygularını not al..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Vazgeç</Button>
            <Button
              onClick={async () => {
                if (!userId || !journalText.trim()) return
                try {
                  await addJournal.mutateAsync({ user_id: userId, mood_type: journalMood, content: journalText.trim() })
                  setJournalText('')
                  setJournalMood('neutral')
                  onClose()
                } catch (e) {
                  console.error(e)
                }
              }}
              disabled={addJournal.isPending}
            >
              {addJournal.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


