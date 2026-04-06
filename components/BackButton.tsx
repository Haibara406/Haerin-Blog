'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { usePageTransition } from './PageTransitionProvider'

export default function BackButton() {
  const { t } = useLanguage()
  const { goBack, navigate } = usePageTransition()
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    // 检查是否有历史记录
    setCanGoBack(window.history.length > 1)
  }, [])

  const handleBack = () => {
    // 如果有历史记录且不是从外部链接进来的，则返回上一页
    // 否则返回首页
    if (canGoBack && document.referrer && document.referrer.includes(window.location.host)) {
      goBack()
    } else {
      navigate({ href: '/' })
    }
  }

  return (
    <button
      onClick={handleBack}
      className="mb-8 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400
                 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {t('post.back')}
    </button>
  )
}
