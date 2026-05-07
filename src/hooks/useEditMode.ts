import { useState, useEffect, useCallback, useRef } from 'react'

interface HighlightRect {
  top: number
  left: number
  width: number
  height: number
}

const HANDOFF_ATTR = 'data-handoff'

function isHandoffElement(el: Element): boolean {
  return el.closest(`[${HANDOFF_ATTR}]`) !== null
}

export function useEditMode(
  active: boolean,
  onElementClick: (pageX: number, pageY: number) => void,
) {
  const [highlight, setHighlight] = useState<HighlightRect | null>(null)
  const highlightRef = useRef<HighlightRect | null>(null)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    if (!el || isHandoffElement(el)) {
      setHighlight(null)
      highlightRef.current = null
      return
    }
    const rect = el.getBoundingClientRect()
    const next = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    }
    highlightRef.current = next
    setHighlight(next)
  }, [])

  const handleClick = useCallback((e: MouseEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    if (!el || isHandoffElement(el)) return
    e.preventDefault()
    e.stopPropagation()
    const pageX = e.clientX + window.scrollX
    const pageY = e.clientY + window.scrollY
    onElementClick(pageX, pageY)
  }, [onElementClick])

  useEffect(() => {
    if (!active) {
      setHighlight(null)
      return
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick, true)
      setHighlight(null)
    }
  }, [active, handleMouseMove, handleClick])

  return { highlight }
}
