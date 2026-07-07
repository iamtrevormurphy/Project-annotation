import { useState, useEffect, useCallback, useRef } from 'react'

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

export type StorageMode = 'auto' | 'local' | 'file'

export interface UseAnnotationsOptions {
  /** Persistence mode. 'auto' (default) uses the dev-server file endpoint when present, else localStorage. */
  storage?: StorageMode
  /** Dev-server endpoint served by the optional Vite plugin. */
  endpoint?: string
  /** localStorage key used by the local adapter. */
  storageKey?: string
}

export const DEFAULT_ENDPOINT = '/handoff-annotations'
export const DEFAULT_STORAGE_KEY = 'handoff-context:pins'

const isBrowser = typeof window !== 'undefined'

interface StorageAdapter {
  load(): Promise<Pin[]>
  save(pins: Pin[]): Promise<void>
}

function pinsFrom(data: unknown): Pin[] {
  const pins = (data as AnnotationStore | null)?.pins
  return Array.isArray(pins) ? pins : []
}

function localAdapter(storageKey: string): StorageAdapter {
  return {
    async load() {
      if (!isBrowser) return []
      try {
        const raw = window.localStorage.getItem(storageKey)
        return raw ? pinsFrom(JSON.parse(raw)) : []
      } catch {
        return []
      }
    },
    async save(pins) {
      if (!isBrowser) return
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ pins }))
      } catch {
        // Quota exceeded / private mode — persistence degrades to in-memory only.
      }
    },
  }
}

function fileAdapter(endpoint: string): StorageAdapter {
  return {
    async load() {
      try {
        const res = await fetch(endpoint)
        if (!res.ok) return []
        return pinsFrom(await res.json())
      } catch {
        return []
      }
    },
    async save(pins) {
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pins }),
        })
      } catch {
        // Endpoint unavailable — writes are silently no-ops.
      }
    },
  }
}

/**
 * Probes the endpoint to decide whether the handoff dev-server file store is present.
 * Returns the loaded pins when detected so we avoid a second round-trip.
 * Detection requires the explicit marker header OR a JSON content-type with a
 * valid `{ pins: [...] }` shape — a plain 200/HTML page is not a false positive.
 */
async function detectFileStore(
  endpoint: string,
): Promise<{ present: boolean; pins: Pin[] }> {
  try {
    const res = await fetch(endpoint)
    if (!res.ok) return { present: false, pins: [] }
    if (res.headers.get('X-Handoff-Context')) {
      return { present: true, pins: pinsFrom(await res.json()) }
    }
    const contentType = res.headers.get('Content-Type') ?? ''
    if (!contentType.includes('application/json')) return { present: false, pins: [] }
    const data = await res.json()
    if (Array.isArray((data as AnnotationStore | null)?.pins)) {
      return { present: true, pins: pinsFrom(data) }
    }
    return { present: false, pins: [] }
  } catch {
    return { present: false, pins: [] }
  }
}

export function useAnnotations(options: UseAnnotationsOptions = {}) {
  const {
    storage = 'auto',
    endpoint = DEFAULT_ENDPOINT,
    storageKey = DEFAULT_STORAGE_KEY,
  } = options

  const [pins, setPins] = useState<Pin[]>([])
  const adapterRef = useRef<StorageAdapter>(localAdapter(storageKey))

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (storage === 'local') {
        adapterRef.current = localAdapter(storageKey)
        const loaded = await adapterRef.current.load()
        if (!cancelled) setPins(loaded)
        return
      }
      if (storage === 'file') {
        adapterRef.current = fileAdapter(endpoint)
        const loaded = await adapterRef.current.load()
        if (!cancelled) setPins(loaded)
        return
      }
      // auto: prefer the file store when the dev endpoint is present.
      const detected = await detectFileStore(endpoint)
      if (cancelled) return
      if (detected.present) {
        adapterRef.current = fileAdapter(endpoint)
        setPins(detected.pins)
      } else {
        adapterRef.current = localAdapter(storageKey)
        setPins(await adapterRef.current.load())
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [storage, endpoint, storageKey])

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
      adapterRef.current.save(updated)
      return updated
    })
    return pin
  }, [])

  const updatePin = useCallback((id: string, note: string) => {
    setPins(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, note } : p)
      adapterRef.current.save(updated)
      return updated
    })
  }, [])

  const deletePin = useCallback((id: string) => {
    setPins(prev => {
      const updated = prev.filter(p => p.id !== id)
      adapterRef.current.save(updated)
      return updated
    })
  }, [])

  return { pins, addPin, updatePin, deletePin }
}
