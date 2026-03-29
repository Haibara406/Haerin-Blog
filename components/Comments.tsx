'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'
import { useLanguage } from './LanguageProvider'

export default function Comments() {
  const commentRef = useRef<HTMLDivElement>(null)
  const { actualTheme } = useTheme()
  const { t } = useLanguage()

  useEffect(() => {
    if (!commentRef.current) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'Haibara406/Haerin-Blog')
    script.setAttribute('data-repo-id', 'R_kgDORzy1EA')
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', 'DIC_kwDORzy1EM4C5ihs')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', actualTheme === 'dark' ? 'transparent_dark' : 'light')
    script.setAttribute('data-lang', 'zh-CN')
    script.setAttribute('data-loading', 'lazy')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true

    commentRef.current.appendChild(script)

    return () => {
      if (commentRef.current) {
        commentRef.current.innerHTML = ''
      }
    }
  }, [actualTheme])

  return (
    <div className="mt-20">
      <h2 className="font-serif text-3xl font-light mb-8 tracking-tight">
        {t('post.comments')}
      </h2>
      <div ref={commentRef} className="giscus-container" />
    </div>
  )
}