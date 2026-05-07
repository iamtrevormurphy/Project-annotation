import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Pin as PinType } from '../hooks/useAnnotations'
import { Popover } from './Popover'
import styles from './Pin.module.css'

interface PinProps {
  pin: PinType
  isOpen: boolean
  onToggle: () => void
  onUpdate: (id: string, note: string) => void
  onDelete: (id: string) => void
}

interface ViewportPos {
  x: number
  y: number
}

function resolvePosition(pin: PinType): ViewportPos | null {
  try {
    const el = document.querySelector(pin.selector)
    if (!el) return null
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return null
    return {
      x: rect.left + pin.offsetXPercent * rect.width,
      y: rect.top + pin.offsetYPercent * rect.height,
    }
  } catch {
    return null
  }
}

export function Pin({ pin, isOpen, onToggle, onUpdate, onDelete }: PinProps) {
  const [pos, setPos] = useState<ViewportPos | null>(() => resolvePosition(pin))
  const isOpenRef = useRef(isOpen)
  const lastKnownPosRef = useRef<ViewportPos | null>(null)

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  // Neutralize focus traps in open menus/popups before the textarea gets focused.
  // useLayoutEffect runs synchronously after DOM mutation, before useEffect in children,
  // so inert is set before Popover's useEffect tries to focus the textarea.
  useLayoutEffect(() => {
    if (!isOpen) return
    const traps = Array.from(
      document.querySelectorAll('[role="menu"], [role="listbox"], [role="dialog"]')
    ).filter(el => !el.closest('[data-handoff]'))
    traps.forEach(el => el.setAttribute('inert', ''))
    return () => traps.forEach(el => el.removeAttribute('inert'))
  }, [isOpen])

  useEffect(() => {
    let rafId: number
    let mutationTimer: ReturnType<typeof setTimeout>

    function update() {
      const resolved = resolvePosition(pin)
      if (resolved) {
        lastKnownPosRef.current = resolved
        setPos(resolved)
      } else if (isOpenRef.current && lastKnownPosRef.current) {
        // Element left the DOM while popover is open — hold position so user can keep typing
        setPos(lastKnownPosRef.current)
      } else {
        setPos(null)
      }
    }

    function scheduleRaf() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    function scheduleMutation() {
      clearTimeout(mutationTimer)
      mutationTimer = setTimeout(update, 80)
    }

    update()

    const observer = new MutationObserver(scheduleMutation)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    })

    window.addEventListener('scroll', scheduleRaf, { capture: true, passive: true })
    window.addEventListener('resize', scheduleRaf)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(mutationTimer)
      observer.disconnect()
      window.removeEventListener('scroll', scheduleRaf, { capture: true })
      window.removeEventListener('resize', scheduleRaf)
    }
  }, [pin.selector, pin.offsetXPercent, pin.offsetYPercent])

  if (!pos) return null

  const popoverLeft = Math.min(pos.x + 12, window.innerWidth - 280)
  const popoverTop = pos.y + 12

  return (
    <>
      <button
        data-handoff
        className={styles.pin}
        style={{ top: pos.y, left: pos.x }}
        onClick={onToggle}
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

      {isOpen && (
        <div
          data-handoff
          style={{ position: 'fixed', top: popoverTop, left: popoverLeft, zIndex: 2147483646 }}
        >
          <Popover
            pin={pin}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClose={onToggle}
          />
        </div>
      )}
    </>
  )
}
