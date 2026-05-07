import React, { useState, useRef, useEffect } from 'react'
import type { Pin as PinType } from '../hooks/useAnnotations'
import { Popover } from './Popover'
import styles from './Pin.module.css'

interface PinProps {
  pin: PinType
  openOnMount?: boolean
  onUpdate: (id: string, note: string) => void
  onDelete: (id: string) => void
}

const POPOVER_OFFSET = 12

export function Pin({ pin, openOnMount, onUpdate, onDelete }: PinProps) {
  const [open, setOpen] = useState(openOnMount ?? false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)
  const markerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open && markerRef.current) {
      const rect = markerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const popoverHeight = 180

      const top = spaceBelow > popoverHeight
        ? pin.pageY + POPOVER_OFFSET
        : pin.pageY - popoverHeight - POPOVER_OFFSET

      const left = Math.min(
        pin.pageX + POPOVER_OFFSET,
        window.scrollX + window.innerWidth - 280,
      )

      setPopoverPos({ top, left })
    }
  }, [open, pin.pageX, pin.pageY])

  const handleDelete = (id: string) => {
    setOpen(false)
    onDelete(id)
  }

  return (
    <>
      <button
        ref={markerRef}
        data-handoff
        className={styles.pin}
        style={{ top: pin.pageY, left: pin.pageX }}
        onClick={() => setOpen(prev => !prev)}
        aria-label="Annotation pin"
      >
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z"
            fill="#6366f1"
          />
          <circle cx="8" cy="8" r="3" fill="#fff" />
        </svg>
      </button>

      {open && popoverPos && (
        <div
          data-handoff
          style={{
            position: 'absolute',
            top: popoverPos.top,
            left: popoverPos.left,
            zIndex: 2147483646,
          }}
        >
          <Popover
            pin={pin}
            onUpdate={onUpdate}
            onDelete={handleDelete}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </>
  )
}
