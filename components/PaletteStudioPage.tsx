'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Languages, Palette } from 'lucide-react'
import Link from '@/components/TransitionLink'
import { useLanguage } from '@/components/LanguageProvider'
import { usePreferences } from '@/components/ThemeProvider'
import { PaletteId } from '@/lib/paletteThemes'

const copy = {
  en: {
    back: 'Back to preferences',
    title: 'Happy Hues Palette Studio',
    subtitle:
      'This page now uses the original Happy Hues structure directly. Left-side palette clicks only preview. The bottom-right button is the actual apply action.',
    current: 'Applied palette',
    preview: 'Previewing',
    mode: 'Current mode',
  },
  zh: {
    back: '返回个性化设置',
    title: 'Happy Hues 配色工作室',
    subtitle: '这个页面现在直接使用原始 Happy Hues 结构。左侧点击只预览，右下角按钮才是真正应用到博客。',
    current: '已应用配色',
    preview: '当前预览',
    mode: '当前模式',
  },
}

function getInitialPaletteId(palette: string) {
  if (palette.startsWith('happy-hues-')) {
    const id = palette.replace('happy-hues-', '')
    return /^[1-9]\d*$/.test(id) ? id : '17'
  }

  return '17'
}

function toPalettePreference(id: string) {
  return `happy-hues-${id}` as PaletteId
}

function buildPreviewSrc(paletteId: string, language: 'en' | 'zh') {
  return `/palette-preview/${paletteId}-${language}.html`
}

export default function PaletteStudioPage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const { language } = useLanguage()
  const text = copy[language]
  const { preferences, actualTheme, setPreferences } = usePreferences()
  const initialPaletteId = getInitialPaletteId(preferences.palette)
  const [selectedPaletteId, setSelectedPaletteId] = useState(initialPaletteId)
  const [iframeSrc, setIframeSrc] = useState(buildPreviewSrc(initialPaletteId, language))
  const [previewBackground, setPreviewBackground] = useState<string>('var(--bg-primary)')

  useEffect(() => {
    if (preferences.palette.startsWith('happy-hues-')) {
      const next = getInitialPaletteId(preferences.palette)
      setSelectedPaletteId(next)
    }
  }, [preferences.palette])

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'happy-hues-sync-language', language },
        window.location.origin,
      )
    } else {
      const expectedSrc = buildPreviewSrc(selectedPaletteId, language)
      if (iframeSrc !== expectedSrc) {
        setIframeSrc(expectedSrc)
      }
    }
  }, [iframeSrc, language, selectedPaletteId])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data || typeof event.data !== 'object') {
        return
      }

      if (event.data.type === 'happy-hues-loaded' && typeof event.data.paletteId === 'string') {
        setSelectedPaletteId(event.data.paletteId)
        if (typeof event.data.backgroundColor === 'string') {
          setPreviewBackground(event.data.backgroundColor)
        }
      }

      if (event.data.type === 'happy-hues-apply' && typeof event.data.paletteId === 'string') {
        setPreferences((current) => ({
          ...current,
          palette: toPalettePreference(event.data.paletteId),
          themeToggleLocked: true,
        }))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setPreferences])

  const appliedPaletteId = preferences.palette.startsWith('happy-hues-')
    ? preferences.palette.replace('happy-hues-', '').padStart(2, '0')
    : language === 'zh'
      ? '未应用'
      : 'Not set'
  const previewPaletteLabel = selectedPaletteId.padStart(2, '0')

  const modeLabel = useMemo(() => {
    if (preferences.mode === 'system') {
      return language === 'zh'
        ? `跟随系统 · ${actualTheme === 'dark' ? '深色' : '浅色'}`
        : `System · ${actualTheme === 'dark' ? 'Dark' : 'Light'}`
    }

    if (preferences.mode === 'dark') {
      return language === 'zh' ? '深色' : 'Dark'
    }

    return language === 'zh' ? '浅色' : 'Light'
  }, [actualTheme, language, preferences.mode])

  return (
    <div className="preferences-page min-h-screen px-4 pb-12 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px] space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Link
              href="/preferences"
              className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{text.back}</span>
            </Link>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                {text.title}
              </p>
              <p className="max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                {text.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 dark:border-gray-800 dark:bg-gray-950/80">
              <Palette className="h-4 w-4" />
              <span>
                {text.current}: {appliedPaletteId}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 dark:border-gray-800 dark:bg-gray-950/80">
              <Languages className="h-4 w-4" />
              <span>
                {text.preview}: {previewPaletteLabel}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 dark:border-gray-800 dark:bg-gray-950/80">
              <span>
                {text.mode}: {modeLabel}
              </span>
            </span>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-[8px] border border-gray-200 shadow-[0_20px_70px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:shadow-[0_20px_70px_rgba(0,0,0,0.28)]"
          style={{ backgroundColor: previewBackground }}
        >
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title={text.title}
            className="h-[calc(100vh-12rem)] w-full border-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  )
}
