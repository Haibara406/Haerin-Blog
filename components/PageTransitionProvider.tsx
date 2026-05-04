'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import MathCurveLoader from '@/components/MathCurveLoader'
import { getCurveConfigById, MATH_CURVE_LOADERS } from '@/lib/mathCurves'
import { usePreferences } from '@/components/ThemeProvider'

type NavigationOptions = {
  href: string
  replace?: boolean
  scroll?: boolean
}

type TransitionContextValue = {
  goBack: () => void
  isTransitioning: boolean
  navigate: (options: NavigationOptions) => void
}

type ActiveTransition = {
  curveId: string
  originPath: string
  startedAt: number
}

const TRANSITION_DELAY_MS = 220
const MIN_VISIBLE_MS = 780
const FAILSAFE_MS = 2400

const PageTransitionContext = createContext<TransitionContextValue>({
  goBack: () => {},
  isTransitioning: false,
  navigate: () => {},
})

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { preferences } = usePreferences()
  const [activeTransition, setActiveTransition] = useState<ActiveTransition | null>(null)
  const lastCurveRef = useRef<string | null>(null)
  const navigationTimerRef = useRef<number | null>(null)
  const finishTimerRef = useRef<number | null>(null)
  const failsafeTimerRef = useRef<number | null>(null)

  const clearTimer = (timerRef: React.MutableRefObject<number | null>) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const clearTimers = () => {
    clearTimer(navigationTimerRef)
    clearTimer(finishTimerRef)
    clearTimer(failsafeTimerRef)
  }

  const finishTransition = (startedAt: number) => {
    const elapsed = Date.now() - startedAt
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)

    clearTimer(finishTimerRef)
    finishTimerRef.current = window.setTimeout(() => {
      setActiveTransition(null)
      clearTimer(failsafeTimerRef)
    }, wait)
  }

  useEffect(() => {
    if (!activeTransition) {
      return
    }

    if (pathname !== activeTransition.originPath) {
      finishTransition(activeTransition.startedAt)
    }
  }, [activeTransition, pathname])

  useEffect(() => () => clearTimers(), [])

  const nextCurveId = () => {
    if (preferences.transitionLoader.mode === 'selected') {
      return getCurveConfigById(preferences.transitionLoader.selectedCurveId)
        ? preferences.transitionLoader.selectedCurveId
        : MATH_CURVE_LOADERS[0].id
    }

    const curveIds = MATH_CURVE_LOADERS.map((curve) => curve.id)

    if (curveIds.length <= 1) {
      return curveIds[0]
    }

    let curveId = curveIds[Math.floor(Math.random() * curveIds.length)]

    if (curveId === lastCurveRef.current) {
      const currentIndex = curveIds.indexOf(curveId)
      curveId = curveIds[(currentIndex + 1) % curveIds.length]
    }

    lastCurveRef.current = curveId
    return curveId
  }

  const beginTransition = (runNavigation: () => void) => {
    if (activeTransition) {
      return
    }

    if (preferences.transitionLoader.mode === 'off') {
      runNavigation()
      return
    }

    const startedAt = Date.now()
    setActiveTransition({
      curveId: nextCurveId(),
      originPath: pathname,
      startedAt,
    })

    navigationTimerRef.current = window.setTimeout(() => {
      runNavigation()
    }, TRANSITION_DELAY_MS)

    failsafeTimerRef.current = window.setTimeout(() => {
      setActiveTransition(null)
    }, FAILSAFE_MS)
  }

  const navigate = ({ href, replace = false, scroll = true }: NavigationOptions) => {
    const targetUrl = new URL(href, window.location.href)
    const currentPath = `${window.location.pathname}${window.location.search}`
    const nextPath = `${targetUrl.pathname}${targetUrl.search}`

    if (currentPath === nextPath) {
      if (replace) {
        router.replace(href, { scroll })
      } else {
        router.push(href, { scroll })
      }
      return
    }

    beginTransition(() => {
      if (replace) {
        router.replace(href, { scroll })
      } else {
        router.push(href, { scroll })
      }
    })
  }

  const goBack = () => {
    beginTransition(() => {
      router.back()
    })
  }

  const activeCurve = useMemo(
    () => (activeTransition ? getCurveConfigById(activeTransition.curveId) ?? null : null),
    [activeTransition],
  )

  return (
    <PageTransitionContext.Provider
      value={{
        goBack,
        isTransitioning: Boolean(activeTransition),
        navigate,
      }}
    >
      {children}
      {activeCurve && (
        <div className="pointer-events-none fixed inset-0 z-[120]">
          <div className="absolute inset-0 bg-white/82 backdrop-blur-2xl dark:bg-black/78" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(23,23,23,0.08),transparent_42%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_42%)]" />
          <div className="relative flex min-h-screen items-center justify-center px-6 text-gray-950 dark:text-white">
            <div className="relative flex h-72 w-72 items-center justify-center sm:h-96 sm:w-96">
              <div className="absolute inset-8 rounded-full border border-current/10 opacity-60" />
              <div className="absolute inset-0 rounded-full bg-current/[0.035] blur-3xl dark:bg-current/[0.06]" />
              <div className="absolute h-52 w-52 rounded-full border border-current/10 sm:h-72 sm:w-72" />
              <MathCurveLoader
                curve={activeCurve}
                className="relative h-40 w-40 sm:h-56 sm:w-56"
                particleScale={1.22}
                strokeOpacity={0.16}
              />
            </div>
          </div>
        </div>
      )}
    </PageTransitionContext.Provider>
  )
}

export function usePageTransition() {
  return useContext(PageTransitionContext)
}
