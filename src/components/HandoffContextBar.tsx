import React, { useState, useCallback, useEffect } from 'react'
import { useAnnotations, type UseAnnotationsOptions } from '../hooks/useAnnotations'
import { useEditMode } from '../hooks/useEditMode'
import { generateSelector } from '../utils/selector'
import { Pin } from './Pin'
import styles from './HandoffContextBar.module.css'

type BarState = 'hidden' | 'visible' | 'editing'

const AddIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M9.5 6.5H6.5V9.5H5.5V6.5H2.5V5.5H5.5V2.5H6.5V5.5H9.5V6.5Z" fill="currentColor" />
  </svg>
)

const ListIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path
      d="M4.5 9H10.5V8H4.5V9ZM1.5 3V4H10.5V3H1.5ZM4.5 6.5H10.5V5.5H4.5V6.5Z"
      fill="currentColor"
    />
  </svg>
)

export type HandoffContextBarProps = UseAnnotationsOptions

export function HandoffContextBar({ storage, endpoint, storageKey }: HandoffContextBarProps = {}) {
  const [barState, setBarState] = useState<BarState>('hidden')
  const [openPinId, setOpenPinId] = useState<string | null>(null)
  const [listOpen, setListOpen] = useState(false)
  const { pins, addPin, updatePin, deletePin } = useAnnotations({ storage, endpoint, storageKey })

  const handleElementClick = useCallback((el: Element, clientX: number, clientY: number) => {
    if (openPinId !== null) {
      setOpenPinId(null)
      return
    }
    const rect = el.getBoundingClientRect()
    const selector = generateSelector(el)
    const offsetXPercent = rect.width > 0 ? (clientX - rect.left) / rect.width : 0.5
    const offsetYPercent = rect.height > 0 ? (clientY - rect.top) / rect.height : 0.5
    const pin = addPin(selector, offsetXPercent, offsetYPercent)
    setOpenPinId(pin.id)
  }, [addPin, openPinId])

  const { highlight } = useEditMode(barState === 'editing', handleElementClick)

  // Close open popover when clicking outside any handoff element in visible mode
  useEffect(() => {
    if (!openPinId || barState === 'editing') return
    const handleOutsideClick = (e: MouseEvent) => {
      const el = e.target as Element | null
      if (!el?.closest('[data-handoff]')) setOpenPinId(null)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [openPinId, barState])

  // Close the annotations list when clicking outside the menu
  useEffect(() => {
    if (!listOpen) return
    const handleOutsideClick = (e: MouseEvent) => {
      const el = e.target as Element | null
      if (!el?.closest('[data-handoff]')) setListOpen(false)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [listOpen])

  const toggleContext = () => {
    setOpenPinId(null)
    setBarState(prev => prev === 'hidden' ? 'visible' : 'hidden')
  }

  const toggleEdit = () => {
    setBarState(prev => prev === 'editing' ? 'visible' : 'editing')
  }

  const handleDeletePin = (id: string) => {
    deletePin(id)
    if (id === openPinId) setOpenPinId(null)
  }

  const jumpToPin = (id: string, selector: string) => {
    setBarState(prev => prev === 'hidden' ? 'visible' : prev)
    setOpenPinId(id)
    setListOpen(false)
    try {
      document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch {
      // Invalid/stale selector — nothing to scroll to
    }
  }

  const contextActive = barState !== 'hidden'
  const editActive = barState === 'editing'

  return (
    <>
      <div className={styles.menu} data-handoff>
        <button
          className={`${styles.pill} ${contextActive ? styles.pillActive : ''}`}
          onClick={toggleContext}
          aria-pressed={contextActive}
        >
          Toggle context
        </button>
        <button
          className={`${styles.iconBtn} ${editActive ? styles.iconBtnActive : ''}`}
          onClick={toggleEdit}
          aria-label="Add annotation"
          aria-pressed={editActive}
        >
          <AddIcon />
        </button>
        <button
          className={`${styles.iconBtn} ${listOpen ? styles.iconBtnActive : ''}`}
          onClick={() => setListOpen(prev => !prev)}
          aria-label="Annotation list"
          aria-pressed={listOpen}
        >
          <ListIcon />
        </button>

        {listOpen && (
          <div className={styles.panel} data-handoff>
            {pins.length === 0 ? (
              <div className={styles.panelEmpty}>No annotations yet</div>
            ) : (
              pins.map((pin, i) => (
                <button
                  key={pin.id}
                  className={styles.panelRow}
                  onClick={() => jumpToPin(pin.id, pin.selector)}
                >
                  <span className={styles.panelIndex}>{i + 1}</span>
                  <span className={pin.note ? styles.panelNote : styles.panelNoteEmpty}>
                    {pin.note || 'Empty note'}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
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

      {contextActive && pins.map(pin => (
        <Pin
          key={pin.id}
          pin={pin}
          isOpen={pin.id === openPinId}
          onToggle={() => setOpenPinId(prev => prev === pin.id ? null : pin.id)}
          onUpdate={updatePin}
          onDelete={handleDeletePin}
        />
      ))}
    </>
  )
}
