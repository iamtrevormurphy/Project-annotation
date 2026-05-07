import React, { useEffect, useRef } from 'react'
import type { Pin } from '../hooks/useAnnotations'
import styles from './Popover.module.css'

interface PopoverProps {
  pin: Pin
  onUpdate: (id: string, note: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function Popover({ pin, onUpdate, onDelete, onClose }: PopoverProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [pin.id])

  // window capture fires before document capture, so stopImmediatePropagation here
  // prevents any document-level focus trap (e.g. MUI Menu/Modal) from stealing
  // focus back when the user clicks into our textarea.
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as Element | null
      if (target?.closest('[data-handoff]')) {
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener('focusin', handleFocusIn, { capture: true })
    return () => window.removeEventListener('focusin', handleFocusIn, { capture: true })
  }, [])

  return (
    <div className={styles.popover} data-handoff>
      <div className={styles.header}>
        <span className={styles.label}>Annotation</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        placeholder="Add annotation or context note…"
        value={pin.note}
        onChange={e => onUpdate(pin.id, e.target.value)}
      />
      <div className={styles.footer}>
        <button className={styles.deleteBtn} onClick={() => onDelete(pin.id)}>
          Delete
        </button>
      </div>
    </div>
  )
}
