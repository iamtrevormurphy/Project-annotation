import React, { useState, useCallback, useEffect } from 'react'
import { useAnnotations } from '../hooks/useAnnotations'
import { useEditMode } from '../hooks/useEditMode'
import { Pin } from './Pin'
import styles from './HandoffContextBar.module.css'

type BarState = 'hidden' | 'visible' | 'editing'

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function HandoffContextBar() {
  const [barState, setBarState] = useState<BarState>('hidden')
  const [openPinId, setOpenPinId] = useState<string | null>(null)
  const { pins, addPin, updatePin, deletePin } = useAnnotations()

  const handleElementClick = useCallback((pageX: number, pageY: number) => {
    // If a popover is open, close it — next click will drop a new pin
    if (openPinId !== null) {
      setOpenPinId(null)
      return
    }
    const pin = addPin(pageX, pageY)
    setOpenPinId(pin.id)
  }, [addPin, openPinId])

  const { highlight } = useEditMode(barState === 'editing', handleElementClick)

  // Close open popover when clicking outside any handoff element in visible mode
  useEffect(() => {
    if (!openPinId || barState === 'editing') return

    const handleOutsideClick = (e: MouseEvent) => {
      const el = e.target as Element | null
      if (!el?.closest('[data-handoff]')) {
        setOpenPinId(null)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [openPinId, barState])

  const toggleContext = () => {
    setOpenPinId(null)
    setBarState(prev => prev === 'hidden' ? 'visible' : 'hidden')
  }

  const toggleEdit = () => {
    setBarState(prev => {
      if (prev === 'editing') return 'visible'
      return 'editing'
    })
  }

  const handleDeletePin = (id: string) => {
    deletePin(id)
    if (id === openPinId) setOpenPinId(null)
  }

  const contextActive = barState !== 'hidden'
  const editActive = barState === 'editing'

  return (
    <>
      <div className={styles.bar} data-handoff>
        <button className={styles.chip} onClick={toggleContext}>
          {contextActive ? 'Disable context' : 'Enable context'}
        </button>
        <button
          className={`${styles.chip} ${styles.editChip} ${editActive ? styles.editActive : ''}`}
          onClick={toggleEdit}
          aria-label="Edit context"
          aria-pressed={editActive}
        >
          <EditIcon />
        </button>
      </div>

      {editActive && highlight && (
        <div
          data-handoff
          className={styles.highlight}
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
          }}
        />
      )}

      {contextActive && (
        <div className={styles.pinsLayer} data-handoff>
          {pins.map(pin => (
            <Pin
              key={pin.id}
              pin={pin}
              isOpen={pin.id === openPinId}
              onToggle={() => setOpenPinId(prev => prev === pin.id ? null : pin.id)}
              onUpdate={updatePin}
              onDelete={handleDeletePin}
            />
          ))}
        </div>
      )}
    </>
  )
}
