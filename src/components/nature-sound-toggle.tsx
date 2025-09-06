"use client"

import { useEffect, useRef, useState } from 'react' 

export function NatureSoundToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.2)
  const TRACKS = [
    { key: 'forest', label: 'Orman', file: '/sounds/forest.mp3', icon: '🌲' },
    { key: 'rain', label: 'Yağmur', file: '/sounds/rain.mp3', icon: '🌧️' },
    { key: 'river', label: 'Nehir', file: '/sounds/river.mp3', icon: '🏞️' },
    { key: 'wind', label: 'Rüzgar', file: '/sounds/wind.mp3', icon: '🌬️' },
    { key: 'waves', label: 'Dalgalar', file: '/sounds/waves.mp3', icon: '🌊' },
  ] as const
  type TrackKey = typeof TRACKS[number]['key']
  const [track, setTrack] = useState<TrackKey>('forest')

  useEffect(() => {
    const savedTrack = (localStorage.getItem('nature_track') as TrackKey) || 'forest'
    setTrack(savedTrack)
    const file = TRACKS.find(t => t.key === savedTrack)?.file || '/sounds/forest.mp3'
    const audio = new Audio(file)
    audio.loop = true
    audioRef.current = audio

    try {
      const savedVol = localStorage.getItem('nature_volume')
      if (savedVol) {
        const v = Math.min(1, Math.max(0, Number(savedVol)))
        setVolume(v)
        audio.volume = v
      } else {
        audio.volume = volume
      }
      const savedPlay = localStorage.getItem('nature_playing')
      if (savedPlay === null || savedPlay === 'true') {
        // Try autoplay by default on first load or if user enabled it before
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
            localStorage.setItem('nature_playing', 'true')
          })
          .catch(() => {
            setIsPlaying(false)
          })
      }
    } finally {
      setIsReady(true)
    }

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      localStorage.setItem('nature_playing', 'false')
    } else {
      try {
        await audio.play()
        setIsPlaying(true)
        localStorage.setItem('nature_playing', 'true')
      } catch (e) {
        // autoplay blocked or other error
      }
    }
  }

  const changeVolume = (v: number) => {
    const audio = audioRef.current
    const clamped = Math.min(1, Math.max(0, v))
    setVolume(clamped)
    if (audio) audio.volume = clamped
    localStorage.setItem('nature_volume', String(clamped))
  }

  const changeTrack = async (next: TrackKey) => {
    setTrack(next)
    localStorage.setItem('nature_track', next)
    const audio = audioRef.current
    const file = TRACKS.find(t => t.key === next)?.file || '/sounds/forest.mp3'
    if (!audio) return
    const wasPlaying = !audio.paused
    audio.pause()
    audio.src = file
    audio.load()
    audio.volume = volume
    if (wasPlaying) {
      try { await audio.play(); setIsPlaying(true) } catch { setIsPlaying(false) }
    }
  }

  const [open, setOpen] = useState(false)

  // Close popover on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onPointer = (e: Event) => {
      const target = e.target as Node | null
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer, { passive: true })
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="fixed bottom-16 md:bottom-20 right-4 z-50">
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          disabled={!isReady}
          onClick={() => setOpen((v) => !v)}
          onDoubleClick={toggle}
          className={`shadow-lg rounded-full p-3 md:p-3.5 transition-colors border backdrop-blur bg-white/90 hover:bg-white ${isPlaying ? 'border-emerald-400' : 'border-gray-200'} `}
          title={isPlaying ? 'Çift tıkla durdur' : 'Çift tıkla başlat'}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="relative inline-flex items-center justify-center">
            <span className="text-xl">{TRACKS.find(t => t.key === track)?.icon || '🌿'}</span>
            {isPlaying && (
              <span className="absolute -right-0.5 -bottom-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
            )}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 -top-2 translate-y-[-100%] rounded-lg border bg-white/95 shadow-xl p-3 w-56">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-700">Parça</div>
              <button
                type="button"
                onClick={toggle}
                className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50"
              >
                {isPlaying ? 'Durdur' : 'Başlat'}
              </button>
            </div>
            <select
              value={track}
              onChange={(e) => changeTrack(e.target.value as TrackKey)}
              className="w-full border rounded px-2 py-1 text-sm mb-3 bg-white"
            >
              {TRACKS.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>

            <div className="text-xs font-medium text-gray-700 mb-2">Ses Seviyesi</div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="h-2 w-full"
            />
            <div className="mt-2 flex justify-between text-[11px] text-gray-500">
              <span>0</span>
              <span>{Math.round(volume * 100)}%</span>
              <span>100</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


