'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_PREFERENCES,
  getFontStack,
  getReadingSizeValue,
  getReadingWidthValue,
  normalizePreferences,
  PREFERENCES_STORAGE_KEY,
  Preferences,
  AppearanceMode,
} from '@/lib/preferences'

type PreferencesUpdater = Preferences | ((current: Preferences) => Preferences)

type PreferencesContextValue = {
  preferences: Preferences
  theme: AppearanceMode
  actualTheme: 'light' | 'dark'
  mounted: boolean
  setPreferences: (updater: PreferencesUpdater, event?: React.MouseEvent) => void
  resetPreferences: (event?: React.MouseEvent) => void
  setTheme: (theme: AppearanceMode, event?: React.MouseEvent) => void
}

const PreferencesContext = createContext<PreferencesContextValue>({
  preferences: DEFAULT_PREFERENCES,
  theme: DEFAULT_PREFERENCES.mode,
  actualTheme: 'light',
  mounted: false,
  setPreferences: () => {},
  resetPreferences: () => {},
  setTheme: () => {},
})

function resolveActualTheme(mode: AppearanceMode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return mode
}

function readStoredPreferences(): Preferences {
  const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)

  if (stored) {
    try {
      return normalizePreferences(JSON.parse(stored))
    } catch {
      return DEFAULT_PREFERENCES
    }
  }

  const legacyTheme = localStorage.getItem('theme')

  if (legacyTheme === 'light' || legacyTheme === 'dark' || legacyTheme === 'system') {
    return {
      ...DEFAULT_PREFERENCES,
      mode: legacyTheme as AppearanceMode,
    }
  }

  return DEFAULT_PREFERENCES
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const preferencesRef = useRef(preferences)

  const applyPreferences = useCallback((nextPreferences: Preferences, x?: number, y?: number) => {
    const root = document.documentElement
    const applied = resolveActualTheme(nextPreferences.mode)

    const applyDom = () => {
      setActualTheme(applied)
      root.classList.toggle('dark', applied === 'dark')
      root.dataset.appearance = applied
      root.dataset.palette = nextPreferences.palette
      root.style.setProperty('--font-body', getFontStack(nextPreferences.fonts.body))
      root.style.setProperty('--font-title', getFontStack(nextPreferences.fonts.title))
      root.style.setProperty('--font-code', getFontStack(nextPreferences.fonts.code))
      root.style.setProperty('--article-font-size', getReadingSizeValue(nextPreferences.reading.size))
      root.style.setProperty('--article-max-width', getReadingWidthValue(nextPreferences.reading.width))
    }

    if (typeof x === 'number' && typeof y === 'number' && document.startViewTransition) {
      const transition = document.startViewTransition(applyDom)

      transition.ready.then(() => {
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        )

        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
    } else {
      applyDom()
    }
  }, [])

  const commitPreferences = useCallback(
    (updater: PreferencesUpdater, event?: React.MouseEvent) => {
      const current = preferencesRef.current
      const next = normalizePreferences(
        typeof updater === 'function' ? updater(current) : updater,
      )

      preferencesRef.current = next
      setPreferencesState(next)
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next))
      localStorage.setItem('theme', next.mode)
      applyPreferences(next, event?.clientX, event?.clientY)
    },
    [applyPreferences],
  )

  const setTheme = useCallback(
    (mode: AppearanceMode, event?: React.MouseEvent) => {
      commitPreferences((current) => ({ ...current, mode }), event)
    },
    [commitPreferences],
  )

  const resetPreferences = useCallback(
    (event?: React.MouseEvent) => {
      commitPreferences(DEFAULT_PREFERENCES, event)
    },
    [commitPreferences],
  )

  useEffect(() => {
    const storedPreferences = readStoredPreferences()
    preferencesRef.current = storedPreferences
    setPreferencesState(storedPreferences)
    setMounted(true)
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(storedPreferences))
    applyPreferences(storedPreferences)
  }, [applyPreferences])

  useEffect(() => {
    if (!mounted || preferences.mode !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyPreferences(preferencesRef.current)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [applyPreferences, mounted, preferences.mode])

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        theme: preferences.mode,
        actualTheme,
        mounted,
        setPreferences: commitPreferences,
        resetPreferences,
        setTheme,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = () => useContext(PreferencesContext)
export const useTheme = () => useContext(PreferencesContext)
