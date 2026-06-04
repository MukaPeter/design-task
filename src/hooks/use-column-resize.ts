import { useRef, useState } from 'react'
import React from 'react'

export function useColumnResize<T extends string>(initial: Record<T, number>) {
  const [colWidths, setColWidths] = useState<Record<T, number>>(initial)
  const resizeRef = useRef<{ col: T; startX: number; startWidth: number } | null>(null)

  function startResize(col: T, e: React.MouseEvent) {
    e.preventDefault()
    resizeRef.current = { col, startX: e.clientX, startWidth: colWidths[col] }

    function onMouseMove(e: MouseEvent) {
      if (!resizeRef.current) return
      const delta = e.clientX - resizeRef.current.startX
      const newWidth = Math.max(60, resizeRef.current.startWidth + delta)
      setColWidths(prev => ({ ...prev, [resizeRef.current!.col]: newWidth }))
    }

    function onMouseUp() {
      resizeRef.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return { colWidths, startResize }
}
