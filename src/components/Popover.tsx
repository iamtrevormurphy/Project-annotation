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
