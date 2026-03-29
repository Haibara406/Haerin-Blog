'use client'

import { useLanguage } from './LanguageProvider'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center
                 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label="Toggle language"
      title={language === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      <span className="text-sm font-medium">
        {language === 'en' ? '中' : 'EN'}
      </span>
    </button>
  )
}