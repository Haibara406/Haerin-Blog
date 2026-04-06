'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import MathCurveLoader from '@/components/MathCurveLoader'
import { getCurveConfigById, TRANSITION_CURVE_IDS } from '@/lib/mathCurves'
import { useLanguage } from './LanguageProvider'

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
  const { t, language } = useLanguage()
  const [activeTransition, setActiveTransition] = useState<ActiveTransition | null>(null)
  const sequenceRef = useRef(0)
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
    const curveId = TRANSITION_CURVE_IDS[sequenceRef.current % TRANSITION_CURVE_IDS.length]
    sequenceRef.current += 1
    return curveId
  }

  const beginTransition = (runNavigation: () => void) => {
    if (activeTransition) {
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
          <div className="absolute inset-0 bg-white/88 backdrop-blur-2xl dark:bg-black/84" />
          <div className="relative flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white/75 p-8 text-center text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-black/[0.04] via-black/[0.01] to-transparent dark:from-white/[0.07] dark:via-white/[0.02] dark:to-transparent">
                <MathCurveLoader
                  curve={activeCurve}
                  className="h-36 w-36"
                  particleScale={1.15}
                  strokeOpacity={0.14}
                />
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-white/50">
                {t('transition.message')}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
                {activeCurve.name[language]}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-white/65">
                {activeCurve.description[language]}
              </p>
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
