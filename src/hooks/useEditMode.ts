import { useState, useEffect, useCallback } from 'react'

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = e.target as Element | null
    if (!el || isHandoffElement(el)) {
      setHighlight(null)
      return
    }
    const rect = el.getBoundingClientRect()
    setHighlight({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    })
  }, [])

  const handleClick = useCallback((e: MouseEvent) => {
    const el = e.target as Element | null
    if (!el || isHandoffElement(el)) return
    e.preventDefault()
    e.stopPropagation()
    onElementClick(e.clientX + window.scrollX, e.clientY + window.scrollY)
  }, [onElementClick])

  useEffect(() => {
    if (!active) {
      setHighlight(null)
      document.body.style.cursor = ''
      return
    }
    document.body.style.cursor = 'crosshair'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick, true)
    return () => {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick, true)
      setHighlight(null)
    }
  }, [active, handleMouseMove, handleClick])

  return { highlight }
}
