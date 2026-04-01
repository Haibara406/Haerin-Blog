'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DraggableTextString from '@/components/DraggableTextString'

interface MimoInteractiveHeroProps {
  title: string
  altTitle: string
  label: string
  pullText: string
  pullHint: string
  backToggleLabel: string
}

interface Point {
  x: number
  y: number
}

interface TrailState {
  targetX: number
  targetY: number
  trailPoints: Point[]
  isInside: boolean
  animationId: number
}

const PATTERN_ROWS = 12
const PATTERN_COLUMNS = 20
const TRAIL_POINTS = 6
const CIRCLE_RADIUS = 220
const OFFSCREEN_POSITION = -320
const EXIT_OFFSET = 400
const POLYGON_SEGMENTS = 48

export default function MimoInteractiveHero({
  title,
  altTitle,
  label,
  pullText,
  pullHint,
  backToggleLabel,
}: MimoInteractiveHeroProps) {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [flipIndex, setFlipIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const altLayerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const altTitleRef = useRef<HTMLHeadingElement>(null)
  const flipInnerRef = useRef<HTMLDivElement>(null)
  const isBack = flipIndex % 2 === 1

  const trailState = useRef<TrailState>({
    targetX: OFFSCREEN_POSITION,
    targetY: OFFSCREEN_POSITION,
    trailPoints: Array.from({ length: TRAIL_POINTS }, () => ({
      x: OFFSCREEN_POSITION,
      y: OFFSCREEN_POSITION,
    })),
    isInside: false,
    animationId: 0,
  })

  const patternRows = useMemo(() => Array.from({ length: PATTERN_ROWS }, (_, idx) => idx), [])
  const patternCols = useMemo(() => Array.from({ length: PATTERN_COLUMNS }, (_, idx) => idx), [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const updatePointerType = () => {
      setIsCoarsePointer(mediaQuery.matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    updatePointerType()
    mediaQuery.addEventListener('change', updatePointerType)
    return () => mediaQuery.removeEventListener('change', updatePointerType)
  }, [])

  useEffect(() => {
    const flipInner = flipInnerRef.current
    if (!flipInner) return

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === 'transform') {
        setIsFlipping(false)
      }
    }

    flipInner.addEventListener('transitionend', onTransitionEnd)
    return () => flipInner.removeEventListener('transitionend', onTransitionEnd)
  }, [])

  useEffect(() => {
    if (!isFlipping) return
    const timer = setTimeout(() => setIsFlipping(false), 1000)
    return () => clearTimeout(timer)
  }, [isFlipping])

  useEffect(() => {
    const syncTitleOffset = () => {
      const mainTitle = titleRef.current
      const invertedTitle = altTitleRef.current
      if (!mainTitle || !invertedTitle) return
      const centeredOffset = (mainTitle.offsetWidth - invertedTitle.offsetWidth) / 2
      invertedTitle.style.transform = `translateX(${centeredOffset}px)`
    }

    syncTitleOffset()
    document.fonts?.ready.then(syncTitleOffset)
    window.addEventListener('resize', syncTitleOffset)
    return () => window.removeEventListener('resize', syncTitleOffset)
  }, [title, altTitle])

  const animateMask = useCallback(() => {
    const state = trailState.current

    for (let idx = 0; idx < TRAIL_POINTS; idx++) {
      const leadX = idx === 0 ? state.targetX : state.trailPoints[idx - 1].x
      const leadY = idx === 0 ? state.targetY : state.trailPoints[idx - 1].y
      const smoothFactor = 0.7 - idx * 0.04
      state.trailPoints[idx].x += (leadX - state.trailPoints[idx].x) * smoothFactor
      state.trailPoints[idx].y += (leadY - state.trailPoints[idx].y) * smoothFactor
    }

    const head = state.trailPoints[0]
    const tail = state.trailPoints[TRAIL_POINTS - 1]
    const angle = Math.atan2(head.y - tail.y, head.x - tail.x)
    const polygonPoints: string[] = []

    for (let idx = 0; idx <= POLYGON_SEGMENTS; idx++) {
      const theta = angle - Math.PI / 2 + (Math.PI * idx) / POLYGON_SEGMENTS
      polygonPoints.push(`${head.x + CIRCLE_RADIUS * Math.cos(theta)}px ${head.y + CIRCLE_RADIUS * Math.sin(theta)}px`)
    }

    for (let idx = 0; idx <= POLYGON_SEGMENTS; idx++) {
      const theta = angle + Math.PI / 2 + (Math.PI * idx) / POLYGON_SEGMENTS
      polygonPoints.push(`${tail.x + CIRCLE_RADIUS * Math.cos(theta)}px ${tail.y + CIRCLE_RADIUS * Math.sin(theta)}px`)
    }

    if (altLayerRef.current) {
      altLayerRef.current.style.clipPath = `polygon(${polygonPoints.join(', ')})`
    }

    const settledTail = state.trailPoints[TRAIL_POINTS - 1]
    const stillMoving =
      Math.abs(state.targetX - settledTail.x) > 1 ||
      Math.abs(state.targetY - settledTail.y) > 1 ||
      state.isInside

    if (stillMoving) {
      state.animationId = requestAnimationFrame(animateMask)
    } else {
      state.animationId = 0
    }
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero || isCoarsePointer || isBack) {
      if (altLayerRef.current) {
        altLayerRef.current.style.clipPath = `circle(0px at ${OFFSCREEN_POSITION}px ${OFFSCREEN_POSITION}px)`
      }
      trailState.current.isInside = false
      if (trailState.current.animationId) {
        cancelAnimationFrame(trailState.current.animationId)
        trailState.current.animationId = 0
      }
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = hero.getBoundingClientRect()
      trailState.current.targetX = event.clientX - rect.left
      trailState.current.targetY = event.clientY - rect.top
      if (!trailState.current.animationId) {
        trailState.current.animationId = requestAnimationFrame(animateMask)
      }
    }

    const handleMouseEnter = (event: MouseEvent) => {
      const rect = hero.getBoundingClientRect()
      const startX = event.clientX - rect.left
      const startY = event.clientY - rect.top
      trailState.current.isInside = true
      trailState.current.targetX = startX
      trailState.current.targetY = startY
      for (let idx = 0; idx < TRAIL_POINTS; idx++) {
        trailState.current.trailPoints[idx] = { x: startX, y: startY }
      }
      if (!trailState.current.animationId) {
        trailState.current.animationId = requestAnimationFrame(animateMask)
      }
    }

    const handleMouseLeave = (event: MouseEvent) => {
      trailState.current.isInside = false
      const rect = hero.getBoundingClientRect()
      const localX = event.clientX - rect.left
      const localY = event.clientY - rect.top
      let exitX = localX
      let exitY = localY

      if (localX <= 0) exitX = -EXIT_OFFSET
      else if (localX >= rect.width) exitX = rect.width + EXIT_OFFSET

      if (localY <= 0) exitY = -EXIT_OFFSET
      else if (localY >= rect.height) exitY = rect.height + EXIT_OFFSET

      trailState.current.targetX = exitX
      trailState.current.targetY = exitY
    }

    hero.addEventListener('mousemove', handleMouseMove)
    hero.addEventListener('mouseenter', handleMouseEnter)
    hero.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove)
      hero.removeEventListener('mouseenter', handleMouseEnter)
      hero.removeEventListener('mouseleave', handleMouseLeave)
      trailState.current.isInside = false
      if (trailState.current.animationId) {
        cancelAnimationFrame(trailState.current.animationId)
        trailState.current.animationId = 0
      }
    }
  }, [animateMask, isBack, isCoarsePointer])

  const toggleFlip = () => {
    if (isFlipping) return
    setIsFlipping(true)
    setFlipIndex((prev) => prev + 1)
  }

  return (
    <section className="mimo-hero-section">
      <div className="mimo-flip-container">
        <div className="mimo-flip-inner" ref={flipInnerRef} style={{ transform: `rotateX(${-180 * flipIndex}deg)` }}>
          <div className="mimo-flip-front" style={isBack ? { pointerEvents: 'none' } : undefined}>
            <div className="mimo-mask-hero" ref={heroRef}>
              <div className="mimo-mask-background">
                <div className="mimo-mask-pattern">
                  {patternRows.map((row) => (
                    <div className="mimo-mask-pattern-row" key={`base-row-${row}`}>
                      {patternCols.map((col) => (
                        <span className="mimo-mask-pattern-text" key={`base-col-${row}-${col}`}>
                          H A E R I N
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <h1 className="mimo-mask-title" ref={titleRef}>
                {title}
              </h1>

              {!isCoarsePointer ? (
                <div
                  className="mimo-mask-alt-layer"
                  ref={altLayerRef}
                  style={{ clipPath: `circle(0px at ${OFFSCREEN_POSITION}px ${OFFSCREEN_POSITION}px)` }}
                >
                  <div className="mimo-mask-pattern-inverted">
                    {patternRows.map((row) => (
                      <div className="mimo-mask-pattern-row-inverted" key={`invert-row-${row}`}>
                        {patternCols.map((col) => (
                          <span className="mimo-mask-pattern-text" key={`invert-col-${row}-${col}`}>
                            H A E R I N
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <h1 className="mimo-mask-alt-title" ref={altTitleRef}>
                    {altTitle}
                  </h1>
                  <span className="mimo-mask-label">{label}</span>
                </div>
              ) : (
                <span className="mimo-mask-mobile-label">{label}</span>
              )}

              <button className="mimo-crack-zone" onClick={toggleFlip} aria-label={label} />
            </div>
          </div>

          <div className="mimo-flip-back" style={isBack ? undefined : { pointerEvents: 'none' }}>
            <div className="mimo-back-content">
              <div className="mimo-back-scroll">
                {isBack && !isFlipping ? (
                  <DraggableTextString
                    key={`${flipIndex}-${pullText}`}
                    text={pullText}
                    hint={pullHint}
                    className="mimo-string-full"
                    fillParent
                  />
                ) : null}
              </div>
              <button className="mimo-back-click-zone" onClick={toggleFlip} aria-label={backToggleLabel}>
                {backToggleLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
