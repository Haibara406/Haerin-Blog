'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme()

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 简化为只在 light 和 dark 之间切换
    if (actualTheme === 'light') {
      setTheme('dark', e)
    } else {
      setTheme('light', e)
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center
                 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label="Toggle theme"
      title={actualTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {actualTheme === 'light' ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}
