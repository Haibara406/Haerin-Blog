'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  actualTheme: 'light' | 'dark'
  setTheme: (theme: Theme, event?: React.MouseEvent) => void
}>({
  theme: 'system',
  actualTheme: 'light',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system'
    setThemeState(savedTheme)
    applyTheme(savedTheme)

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (savedTheme === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const applyTheme = (newTheme: Theme, x?: number, y?: number) => {
    let applied: 'light' | 'dark' = 'light'

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applied = prefersDark ? 'dark' : 'light'
    } else {
      applied = newTheme
    }

    // 如果浏览器支持 View Transitions API 且提供了坐标
    if (typeof x === 'number' && typeof y === 'number' && document.startViewTransition) {
      const isDark = applied === 'dark'

      const transition = document.startViewTransition(() => {
        setActualTheme(applied)
        document.documentElement.classList.toggle('dark', isDark)
      })

      transition.ready.then(() => {
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        )
      })
    } else {
      // 降级方案：直接切换
      setActualTheme(applied)
      document.documentElement.classList.toggle('dark', applied === 'dark')
    }
  }

  const setTheme = (newTheme: Theme, event?: React.MouseEvent) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)

    if (event) {
      applyTheme(newTheme, event.clientX, event.clientY)
    } else {
      applyTheme(newTheme)
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
