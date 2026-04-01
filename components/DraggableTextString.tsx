'use client'

import { useEffect, useMemo, useRef } from 'react'
import { layoutWithLines, prepareWithSegments } from '@/components/textstring/pretext'

interface DraggableTextStringProps {
  text: string
  hint: string
  minHeight?: number
  className?: string
  fillParent?: boolean
}

interface LetterState {
  ch: string
  w: number
  x: number
  y: number
  ox: number
  oy: number
  px: number
  py: number
  readingIdx: number
  locked: boolean
}

interface DragState {
  idx: number
  offsetX: number
  offsetY: number
}

const DEFAULT_MIN_HEIGHT = 240
const FONT = '20px Georgia'
const LINE_HEIGHT = 28
const MARGIN = 20
const CONSTRAINT_DIST = 1.2
const UNLOCK_THRESHOLD = 1
const ITERATIONS = 12
const DAMPING = 0.97
const GRAVITY = 0.15
const RADIUS = 7

function getSegmenter() {
  try {
    return new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  } catch {
    return null
  }
}

function graphemesOf(segmenter: Intl.Segmenter | null, text: string): string[] {
  if (segmenter) return [...segmenter.segment(text)].map((s) => s.segment)
  return Array.from(text)
}

export default function DraggableTextString({
  text,
  hint,
  minHeight = DEFAULT_MIN_HEIGHT,
  className = '',
  fillParent = false,
}: DraggableTextStringProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const stableText = useMemo(() => text, [text])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !stableText.trim()) return
    const container = stage

    container.innerHTML = ''

    const segmenter = getSegmenter()
    const measureCtx = document.createElement('canvas').getContext('2d')
    if (!measureCtx) return

    measureCtx.font = FONT

    const prepared = prepareWithSegments(stableText, FONT)
    const allGraphemes = graphemesOf(segmenter, stableText)
    const graphemeWidths = allGraphemes.map((g) => measureCtx.measureText(g).width)

    const getMaxWidth = () => Math.max(container.getBoundingClientRect().width - MARGIN * 2, 120)

    function layoutPositions(maxWidth: number) {
      const rawPositions: Array<{ x: number; y: number; w: number }> = []
      let x = 0
      let lineY = 0

      for (let gi = 0; gi < allGraphemes.length; gi++) {
        const g = allGraphemes[gi]
        const w = graphemeWidths[gi]

        if (g !== ' ' && x > 0 && x + w > maxWidth) {
          x = 0
          lineY += LINE_HEIGHT
        }

        if (g === ' ' && x > 0) {
          let wordW = 0
          for (let j = gi + 1; j < allGraphemes.length && allGraphemes[j] !== ' '; j++) {
            wordW += graphemeWidths[j]
          }

          if (x + w + wordW > maxWidth) {
            rawPositions.push({ x: x + MARGIN, y: lineY, w })
            x = 0
            lineY += LINE_HEIGHT
            continue
          }
        }

        rawPositions.push({ x: x + MARGIN, y: lineY, w })
        x += w
      }

      const totalHeight = lineY + LINE_HEIGHT
      const rect = container.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const offsetY = fillParent ? 0 : Math.max(0, (viewportHeight - rect.top - totalHeight) * 0.3)

      return {
        positions: rawPositions.map((p) => ({ x: p.x, y: p.y + offsetY, w: p.w })),
        totalHeight: totalHeight + offsetY,
      }
    }

    function buildZigzagMapping(maxWidth: number) {
      const { lines } = layoutWithLines(prepared, maxWidth, LINE_HEIGHT)
      const lineIndices: number[][] = []
      let gi = 0

      for (let li = 0; li < lines.length; li++) {
        const lineGraphemes = graphemesOf(segmenter, lines[li].text)
        const indices: number[] = []
        for (let j = 0; j < lineGraphemes.length; j++) indices.push(gi++)
        lineIndices.push(indices)
      }

      const lastLineIdx = lineIndices.length - 1
      const needFlip = lastLineIdx % 2 === 1
      const stringOrder: number[] = []

      for (let li = 0; li < lineIndices.length; li++) {
        const reversed = needFlip ? li % 2 === 0 : li % 2 === 1
        if (reversed) stringOrder.push(...[...lineIndices[li]].reverse())
        else stringOrder.push(...lineIndices[li])
      }

      if (stringOrder.length !== allGraphemes.length) {
        return Array.from({ length: allGraphemes.length }, (_, idx) => idx)
      }

      return stringOrder
    }

    const maxWidth = getMaxWidth()
    let positions = layoutPositions(maxWidth)

    const parentMinHeight = fillParent ? container.parentElement?.clientHeight ?? 0 : 0
    const effectiveMinHeight = Math.max(minHeight, parentMinHeight)
    container.style.height = `${Math.max(positions.totalHeight + 20, effectiveMinHeight)}px`

    const stringOrder = buildZigzagMapping(maxWidth)

    const letters: LetterState[] = stringOrder.map((ri) => {
      const p = positions.positions[ri]
      return {
        ch: allGraphemes[ri],
        w: p.w,
        x: p.x,
        y: p.y,
        ox: p.x,
        oy: p.y,
        px: p.x,
        py: p.y,
        readingIdx: ri,
        locked: true,
      }
    })

    function computeRestLengths() {
      const rests: number[] = []
      for (let i = 0; i < letters.length - 1; i++) {
        const a = letters[i]
        const b = letters[i + 1]
        const dist = Math.hypot(
          b.ox + b.w / 2 - (a.ox + a.w / 2),
          b.oy + LINE_HEIGHT / 2 - (a.oy + LINE_HEIGHT / 2)
        )
        rests.push(dist * CONSTRAINT_DIST)
      }
      return rests
    }

    const restLengths = computeRestLengths()

    const els: HTMLSpanElement[] = []
    for (const l of letters) {
      const span = document.createElement('span')
      span.className = 'mimo-string-letter'
      span.textContent = l.ch
      container.appendChild(span)
      els.push(span)
    }

    const hintEl = document.createElement('div')
    hintEl.className = 'mimo-string-hint'
    hintEl.textContent = hint
    hintEl.style.opacity = '0'
    container.appendChild(hintEl)

    const lastIdx = letters.length - 1
    for (let i = lastIdx; i > lastIdx - 6 && i >= 0; i--) {
      letters[i].locked = false
      els[i].classList.add('draggable')
    }

    function positionHint() {
      const last = letters[lastIdx]
      hintEl.style.transform = `translate(${last.ox - 30}px, ${last.oy + LINE_HEIGHT + 2}px)`
    }

    positionHint()
    const hintTimer = window.setTimeout(() => {
      hintEl.style.opacity = '1'
    }, 500)

    const drags = new Map<number, DragState>()

    function isDragged(idx: number) {
      for (const d of drags.values()) {
        if (d.idx === idx) return true
      }
      return false
    }

    function onPointerDown(e: PointerEvent) {
      const idx = els.indexOf(e.target as HTMLSpanElement)
      if (idx === -1 || letters[idx].locked || isDragged(idx)) return

      const rect = container.getBoundingClientRect()
      drags.set(e.pointerId, {
        idx,
        offsetX: e.clientX - rect.left - letters[idx].x,
        offsetY: e.clientY - rect.top - letters[idx].y,
      })

      els[idx].classList.add('dragging')
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      e.preventDefault()
    }

    function onPointerMove(e: PointerEvent) {
      const d = drags.get(e.pointerId)
      if (!d) return

      const rect = container.getBoundingClientRect()
      const l = letters[d.idx]
      l.x = e.clientX - rect.left - d.offsetX
      l.y = e.clientY - rect.top - d.offsetY
      l.px = l.x
      l.py = l.y
      l.locked = false
    }

    function releasePointer(e: PointerEvent) {
      const d = drags.get(e.pointerId)
      if (!d) return
      els[d.idx].classList.remove('dragging')
      drags.delete(e.pointerId)
    }

    let gravityOn = true
    let unraveling = false
    let unravelIdx = -1

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'f' && e.key !== 'F') return
      gravityOn = !gravityOn
      if (gravityOn && !unraveling) {
        unraveling = true
        hintEl.style.opacity = '0'
        unravelIdx = letters.length - 1
        while (unravelIdx >= 0 && !letters[unravelIdx].locked) unravelIdx--
      }
    }

    function onResize() {
      const newPositions = layoutPositions(getMaxWidth())
      positions = newPositions

      const parentMinHeightResize = fillParent ? container.parentElement?.clientHeight ?? 0 : 0
      const effectiveMinHeightResize = Math.max(minHeight, parentMinHeightResize)
      container.style.height = `${Math.max(newPositions.totalHeight + 20, effectiveMinHeightResize)}px`

      for (let i = 0; i < letters.length; i++) {
        const np = newPositions.positions[letters[i].readingIdx]
        if (letters[i].locked) {
          letters[i].x = np.x
          letters[i].y = np.y
          letters[i].ox = np.x
          letters[i].oy = np.y
          letters[i].px = np.x
          letters[i].py = np.y
        } else {
          letters[i].ox = np.x
          letters[i].oy = np.y
        }
      }

      positionHint()
    }

    function simulate() {
      if (unraveling) {
        if (!gravityOn || unravelIdx < 0) {
          unraveling = false
        } else if (letters[unravelIdx].locked) {
          letters[unravelIdx].locked = false
          letters[unravelIdx].px = letters[unravelIdx].x
          letters[unravelIdx].py = letters[unravelIdx].y - 0.5
          unravelIdx--
        } else {
          unravelIdx--
        }
      }

      for (let i = letters.length - 2; i >= 0; i--) {
        if (letters[i].locked && !letters[i + 1].locked) {
          const a = letters[i]
          const b = letters[i + 1]
          const dx = b.x + b.w / 2 - (a.ox + a.w / 2)
          const dy = b.y + LINE_HEIGHT / 2 - (a.oy + LINE_HEIGHT / 2)
          const dist = Math.hypot(dx, dy)
          if (dist > restLengths[i] + UNLOCK_THRESHOLD) {
            a.locked = false
            a.px = a.x
            a.py = a.y
            hintEl.style.opacity = '0'
          }
        }
      }

      for (let i = 0; i < letters.length; i++) {
        const l = letters[i]
        if (l.locked || isDragged(i)) continue
        const vx = (l.x - l.px) * DAMPING
        const vy = (l.y - l.py) * DAMPING
        l.px = l.x
        l.py = l.y
        l.x += vx
        l.y += vy + (gravityOn ? GRAVITY : 0)
      }

      for (let iter = 0; iter < ITERATIONS; iter++) {
        for (let i = 0; i < letters.length - 1; i++) {
          const a = letters[i]
          const b = letters[i + 1]
          if (a.locked && b.locked) continue

          const ax = a.x + a.w / 2
          const ay = a.y + LINE_HEIGHT / 2
          const bx = b.x + b.w / 2
          const by = b.y + LINE_HEIGHT / 2
          const dx = bx - ax
          const dy = by - ay
          const dist = Math.hypot(dx, dy) || 0.001
          const diff = (dist - restLengths[i]) / dist

          const aFixed = a.locked || isDragged(i)
          const bFixed = b.locked || isDragged(i + 1)

          if (aFixed && !bFixed) {
            b.x -= dx * diff
            b.y -= dy * diff
          } else if (!aFixed && bFixed) {
            a.x += dx * diff
            a.y += dy * diff
          } else if (!aFixed && !bFixed) {
            a.x += dx * diff * 0.5
            a.y += dy * diff * 0.5
            b.x -= dx * diff * 0.5
            b.y -= dy * diff * 0.5
          }
        }
      }

      for (let i = 0; i < letters.length; i++) {
        if (letters[i].locked) continue
        const a = letters[i]
        const acx = a.x + a.w / 2
        const acy = a.y + LINE_HEIGHT / 2

        for (let j = i + 1; j < letters.length; j++) {
          if (letters[j].locked || Math.abs(i - j) === 1) continue
          const b = letters[j]

          const bcx = b.x + b.w / 2
          const bcy = b.y + LINE_HEIGHT / 2
          const dx = bcx - acx
          const dy = bcy - acy
          const dist = Math.hypot(dx, dy) || 0.001
          const minDist = RADIUS * 2

          if (dist < minDist) {
            const overlap = ((minDist - dist) / dist) * 0.5
            const aD = isDragged(i)
            const bD = isDragged(j)
            if (aD) {
              b.x += dx * overlap
              b.y += dy * overlap
            } else if (bD) {
              a.x -= dx * overlap
              a.y -= dy * overlap
            } else {
              a.x -= dx * overlap
              a.y -= dy * overlap
              b.x += dx * overlap
              b.y += dy * overlap
            }
          }
        }
      }

      const cRect = container.getBoundingClientRect()
      const minX = 0
      const minY = 0
      const maxX = cRect.width
      const maxY = cRect.height
      const bounce = 0.4

      for (let i = 0; i < letters.length; i++) {
        const l = letters[i]
        if (l.locked || isDragged(i)) continue

        if (l.x < minX) {
          l.x = minX
          l.px = l.x + (l.x - l.px) * bounce
        }
        if (l.x + l.w > maxX) {
          l.x = maxX - l.w
          l.px = l.x + (l.x - l.px) * bounce
        }
        if (l.y < minY) {
          l.y = minY
          l.py = l.y + (l.y - l.py) * bounce
        }
        if (l.y + LINE_HEIGHT > maxY) {
          l.y = maxY - LINE_HEIGHT
          l.py = l.y + (l.y - l.py) * bounce
        }
      }
    }

    const FIXED_DT = 1 / 120
    const MAX_STEPS = 4
    let accumulator = 0
    let lastTime = -1
    let rafId = 0

    function render(now: number) {
      if (lastTime < 0) {
        lastTime = now
        rafId = requestAnimationFrame(render)
        return
      }

      const dt = Math.min((now - lastTime) / 1000, MAX_STEPS * FIXED_DT)
      lastTime = now
      accumulator += dt

      while (accumulator >= FIXED_DT) {
        simulate()
        accumulator -= FIXED_DT
      }

      for (let i = 0; i < letters.length; i++) {
        if (!letters[i].locked) els[i].classList.add('draggable')
        els[i].style.transform = `translate(${letters[i].x}px, ${letters[i].y}px)`
      }

      rafId = requestAnimationFrame(render)
    }

    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', releasePointer)
    window.addEventListener('pointercancel', releasePointer)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    rafId = requestAnimationFrame(render)

    return () => {
      window.clearTimeout(hintTimer)
      cancelAnimationFrame(rafId)
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', releasePointer)
      window.removeEventListener('pointercancel', releasePointer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [fillParent, hint, minHeight, stableText])

  return (
    <div className={`mimo-string-wrap ${className}`.trim()}>
      <div className="mimo-string-stage" ref={stageRef} />
    </div>
  )
}
