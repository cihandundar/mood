'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type CheckInData = {
  stressLevel: number
  energyLevel: number
  sleepHours?: number
}

type Props = {
  open: boolean
  onClose: () => void
  onSave: (data: CheckInData) => void | Promise<void>
  defaultValues?: Partial<CheckInData>
}

export function CheckInModal({ open, onClose, onSave, defaultValues }: Props) {
  const [stress, setStress] = useState<number>(defaultValues?.stressLevel ?? 5)
  const [energy, setEnergy] = useState<number>(defaultValues?.energyLevel ?? 5)
  const [sleep, setSleep] = useState<number>(defaultValues?.sleepHours ?? 7)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(0) // 0..2

  const totalSteps = 3

  if (!open) return null

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave({
        stressLevel: stress,
        energyLevel: energy,
        sleepHours: sleep,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl border border-green-200 p-6 m-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Kısa Check‑in</h2>
        <p className="text-sm text-gray-600 mb-4">Adım {step + 1}/{totalSteps}</p>

        {/* Stepper */}
        <div className="mb-4 h-2 w-full bg-gray-100 rounded-full">
          <div
            className="h-2 bg-green-500 rounded-full transition-all"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-5">
          {step === 0 && (
            <div>
              <Label htmlFor="stress" className="text-gray-700">Stres: {stress}/10</Label>
              <input id="stress" type="range" min={1} max={10} value={stress} onChange={(e) => setStress(Number(e.target.value))} className="w-full" />
            </div>
          )}

          {step === 1 && (
            <div>
              <Label htmlFor="energy" className="text-gray-700">Enerji: {energy}/10</Label>
              <input id="energy" type="range" min={1} max={10} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full" />
            </div>
          )}

          {step === 2 && (
            <div>
              <Label htmlFor="sleep" className="text-gray-700 mb-3">Uyku (saat)</Label>
              <Input id="sleep" type="number" min={0} max={14} step={0.5} value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="bg-white border-green-200 text-gray-900" />
            </div>
          )}
        </div>

        {/* Summary Table */}
        <div className="mt-6 border rounded-lg">
          <div className="p-3 text-sm font-medium bg-gray-50 border-b">Özet</div>
          <div className="p-3 text-sm">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-3 text-gray-600">Stres</td>
                  <td className="py-1 font-medium">{stress}/10</td>
                </tr>
                <tr>
                  <td className="py-1 pr-3 text-gray-600">Enerji</td>
                  <td className="py-1 font-medium">{energy}/10</td>
                </tr>
                <tr>
                  <td className="py-1 pr-3 text-gray-600">Uyku</td>
                  <td className="py-1 font-medium">{sleep} saat</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} className="border-green-300 text-gray-700 hover:bg-green-50">Kapat</Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}>Geri</Button>
            )}
            {step < totalSteps - 1 && (
              <Button onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}>İleri</Button>
            )}
            {step === totalSteps - 1 && (
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


