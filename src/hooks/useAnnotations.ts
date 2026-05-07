import { useState, useEffect, useCallback } from 'react'

export interface Pin {
  id: string
  selector: string
  offsetXPercent: number
  offsetYPercent: number
  note: string
  createdAt: string
}

interface AnnotationStore {
  pins: Pin[]
}

const ANNOTATIONS_URL = '/handoff-annotations'

async function loadFromServer(): Promise<Pin[]> {
  try {
    const res = await fetch(ANNOTATIONS_URL)
    if (!res.ok) return []
    const data: AnnotationStore = await res.json()
    return data.pins ?? []
  } catch {
    return []
  }
}

async function saveToServer(pins: Pin[]): Promise<void> {
  try {
    await fetch(ANNOTATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pins }),
    })
  } catch {
    // In production (no dev server), writes are silently no-ops
  }
}

export function useAnnotations() {
  const [pins, setPins] = useState<Pin[]>([])

  useEffect(() => {
    loadFromServer().then(setPins)
  }, [])

  const addPin = useCallback((
    selector: string,
    offsetXPercent: number,
    offsetYPercent: number,
  ): Pin => {
    const pin: Pin = {
      id: crypto.randomUUID(),
      selector,
      offsetXPercent,
      offsetYPercent,
      note: '',
      createdAt: new Date().toISOString(),
    }
    setPins(prev => {
      const updated = [...prev, pin]
      saveToServer(updated)
      return updated
    })
    return pin
  }, [])

  const updatePin = useCallback((id: string, note: string) => {
    setPins(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, note } : p)
      saveToServer(updated)
      return updated
    })
  }, [])

  const deletePin = useCallback((id: string) => {
    setPins(prev => {
      const updated = prev.filter(p => p.id !== id)
      saveToServer(updated)
      return updated
    })
  }, [])

  return { pins, addPin, updatePin, deletePin }
}
