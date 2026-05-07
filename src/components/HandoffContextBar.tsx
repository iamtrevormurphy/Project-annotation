import React, { useState, useCallback } from 'react'
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
  const [newPinId, setNewPinId] = useState<string | null>(null)
  const { pins, addPin, updatePin, deletePin } = useAnnotations()

  const handleElementClick = useCallback(async (pageX: number, pageY: number) => {
    const pin = await addPin(pageX, pageY)
    setNewPinId(pin.id)
  }, [addPin])

  const { highlight } = useEditMode(barState === 'editing', handleElementClick)

  const toggleContext = () => {
    setBarState(prev => prev === 'hidden' ? 'visible' : 'hidden')
  }

  const toggleEdit = () => {
    setBarState(prev => {
      if (prev === 'editing') return 'visible'
      return 'editing'
    })
  }

  const contextActive = barState !== 'hidden'
  const editActive = barState === 'editing'

  return (
    <>
      {/* Chip bar */}
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

      {/* Edit mode hover highlight */}
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

      {/* Edit mode cursor overlay */}
      {editActive && <div className={styles.editOverlay} data-handoff />}

      {/* Pins layer */}
      {contextActive && (
        <div className={styles.pinsLayer} data-handoff>
          {pins.map(pin => (
            <Pin
              key={pin.id}
              pin={pin}
              openOnMount={pin.id === newPinId}
              onUpdate={(id, note) => {
                updatePin(id, note)
                if (id === newPinId) setNewPinId(null)
              }}
              onDelete={id => {
                deletePin(id)
                if (id === newPinId) setNewPinId(null)
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}
