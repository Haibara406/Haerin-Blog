'use client'

import { useEffect, useMemo, useRef } from 'react'
import {
  buildCurvePath,
  getCurveDetailScale,
  getCurveParticle,
  getCurveRotation,
  MathCurveConfig,
} from '@/lib/mathCurves'

type MathCurveLoaderProps = {
  curve: MathCurveConfig
  className?: string
  particleMode?: 'compact' | 'full'
  particleScale?: number
  strokeOpacity?: number
}

function phaseFromId(id: string) {
  let hash = 0

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 997
  }

  return (hash % 100) / 100
}

export default function MathCurveLoader({
  curve,
  className,
  particleMode = 'full',
  particleScale = 1,
  strokeOpacity = 0.12,
}: MathCurveLoaderProps) {
  const groupRef = useRef<SVGGElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const particleRefs = useRef<Array<SVGCircleElement | null>>([])
  const particleCount = useMemo(
    () => (particleMode === 'compact' ? Math.min(curve.particleCount, 52) : curve.particleCount),
    [curve.particleCount, particleMode],
  )
  const phaseOffset = useMemo(() => phaseFromId(curve.id), [curve.id])

  useEffect(() => {
    const group = groupRef.current
    const path = pathRef.current

    if (!group || !path) {
      return
    }

    let frameId = 0
    const startedAt = performance.now()

    const render = (now: number) => {
      const time = now - startedAt
      const progress =
        ((time + phaseOffset * curve.durationMs) % curve.durationMs) / curve.durationMs
      const detailScale = getCurveDetailScale(time, curve, phaseOffset)
      const rotation = getCurveRotation(time, curve, phaseOffset)

      group.setAttribute('transform', `rotate(${rotation} 50 50)`)
      path.setAttribute('d', buildCurvePath(curve, detailScale))

      particleRefs.current.forEach((node, index) => {
        if (!node) {
          return
        }

        const particle = getCurveParticle(curve, index, particleCount, progress, detailScale)
        node.setAttribute('cx', particle.x.toFixed(2))
        node.setAttribute('cy', particle.y.toFixed(2))
        node.setAttribute('r', (particle.radius * particleScale).toFixed(2))
        node.setAttribute('opacity', particle.opacity.toFixed(3))
      })

      frameId = window.requestAnimationFrame(render)
    }

    frameId = window.requestAnimationFrame(render)

    return () => window.cancelAnimationFrame(frameId)
  }, [curve, particleCount, particleScale, phaseOffset])

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g ref={groupRef}>
        <path
          ref={pathRef}
          stroke="currentColor"
          strokeWidth={curve.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={strokeOpacity}
        />
        {Array.from({ length: particleCount }, (_, index) => (
          <circle
            // eslint-disable-next-line react/no-array-index-key
            key={`${curve.id}-${index}`}
            ref={(node) => {
              particleRefs.current[index] = node
            }}
            fill="currentColor"
          />
        ))}
      </g>
    </svg>
  )
}
