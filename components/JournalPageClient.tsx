'use client'

import { CSSProperties, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  KeyRound,
  LockKeyhole,
  Moon,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

type JournalType = 'daily' | 'weekly' | 'monthly' | 'yearly'

type JournalMetricValue = number | null

type JournalEntry = {
  slug: string
  type: JournalType
  title: string
  date: string
  periodLabel: string
  yearId: string
  monthId: string
  weekId: string
  highlight: string
  nextFocus: string
  excerpt: string
  contentHtml: string
  metrics: {
    caloriesBurned: JournalMetricValue
    exerciseMinutes: JournalMetricValue
    steps: JournalMetricValue
    walkingDistanceKm: JournalMetricValue
    sleepHours: JournalMetricValue
    studyHours: JournalMetricValue
    totalStudyHours: JournalMetricValue
  }
  related: Array<{
    type: JournalType
    slug: string
    title: string
    date: string
    highlight: string
  }>
  sample?: boolean
}

type JournalReference = Pick<JournalEntry, 'type' | 'slug'>

type JournalDataset = {
  version: number
  generatedAt: string
  counts: Record<JournalType, number>
  entries: JournalEntry[]
}

type EncryptedPayload = {
  version: number
  algorithm: 'AES-GCM'
  kdf: {
    name: 'PBKDF2'
    hash: 'SHA-256'
    iterations: number
    salt: string
  }
  iv: string
  ciphertext: string
}

const typeOrder: JournalType[] = ['daily', 'weekly', 'monthly', 'yearly']

const copy = {
  en: {
    lockedKicker: 'Private Journal',
    lockedTitle: 'A quiet room behind glass',
    lockedBody:
      'The journal is encrypted before it reaches the site. Enter the password to decrypt it locally in this browser session.',
    passwordLabel: 'Journal password',
    passwordPlaceholder: 'Enter password',
    unlock: 'Unlock journal',
    unlocking: 'Decrypting',
    lock: 'Lock journal',
    privacyNote: 'Nothing is stored after you leave or refresh this page.',
    missingPayload:
      'Encrypted journal data is not available yet. Run the journal build script locally first.',
    wrongPassword: 'Unable to decrypt. Please check the password and try again.',
    unsupportedCrypto: 'This browser does not support Web Crypto decryption.',
    unlockedKicker: 'Journal Time Capsule',
    unlockedTitle: 'Daily, weekly, monthly, and yearly reflections',
    unlockedBody:
      'A private space for non-technical reviews, kept separate from the public blog archive and tags.',
    entries: 'entries',
    emptyTitle: 'Nothing here yet',
    emptyBody: 'This section is ready, but no public encrypted entries are available.',
    highlight: 'Highlight',
    nextFocus: 'Next focus',
    related: 'Related notes',
    generated: 'Encrypted payload',
    open: 'Open',
    timeline: 'Memory Filmstrip',
    timelineHint:
      'Pick an entry from this horizontal strip. It keeps browsing compact while the reading page stays centered.',
    sample: 'Sample',
    relatedHint: 'Showing the nearest related notes to keep the reading flow quiet.',
    moreRelated: 'more',
    types: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    },
    metricLabels: {
      study: 'Study',
      sleep: 'Sleep',
      steps: 'Steps',
      exercise: 'Exercise',
    },
  },
  zh: {
    lockedKicker: '私密日志',
    lockedTitle: '一间隔着玻璃的安静房间',
    lockedBody:
      '日志在进入站点前已经加密。输入密码后，内容只会在当前浏览器页面里本地解密。',
    passwordLabel: '日志密码',
    passwordPlaceholder: '输入密码',
    unlock: '解锁日志',
    unlocking: '正在解密',
    lock: '重新上锁',
    privacyNote: '离开或刷新页面后不会保留解锁状态。',
    missingPayload: '还没有可用的加密日志数据。请先在本地运行日志构建脚本。',
    wrongPassword: '无法解密，请检查密码后再试一次。',
    unsupportedCrypto: '当前浏览器不支持 Web Crypto 解密。',
    unlockedKicker: '日志时间舱',
    unlockedTitle: '日报、周报、月报与年报',
    unlockedBody: '这里存放非技术复盘内容，并且与公开技术博客的归档和标签完全隔离。',
    entries: '篇',
    emptyTitle: '这里还没有内容',
    emptyBody: '功能已经准备好，但当前没有可公开解密的记录。',
    highlight: '最想记住',
    nextFocus: '下一步关注',
    related: '关联记录',
    generated: '加密数据',
    open: '打开',
    timeline: '记忆胶片',
    timelineHint: '从这条横向胶片里选择记录，浏览入口保持克制，正文始终居中阅读。',
    sample: '样例',
    relatedHint: '这里只展示最接近的关联记录，避免把阅读区拖得过长。',
    moreRelated: '条更多',
    types: {
      daily: '日报',
      weekly: '周报',
      monthly: '月报',
      yearly: '年报',
    },
    metricLabels: {
      study: '学习',
      sleep: '睡眠',
      steps: '步数',
      exercise: '运动',
    },
  },
}

function bytesFromBase64(value: string) {
  const binary = window.atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

async function decryptPayload(payload: EncryptedPayload, password: string): Promise<JournalDataset> {
  if (!window.crypto?.subtle) {
    throw new Error('unsupported-crypto')
  }

  const encoder = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: payload.kdf.hash,
      salt: bytesFromBase64(payload.kdf.salt),
      iterations: payload.kdf.iterations,
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: bytesFromBase64(payload.iv),
    },
    key,
    bytesFromBase64(payload.ciphertext),
  )

  return JSON.parse(new TextDecoder().decode(decrypted)) as JournalDataset
}

function formatNumber(value: JournalMetricValue, suffix = '') {
  if (value === null || value === undefined) {
    return '—'
  }

  return `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`
}

function getInitialHash() {
  if (typeof window === 'undefined') {
    return { type: 'daily' as JournalType, slug: '' }
  }

  const [type, slug] = window.location.hash.replace(/^#/, '').split('/')
  return {
    type: typeOrder.includes(type as JournalType) ? (type as JournalType) : 'daily',
    slug: slug || '',
  }
}

export default function JournalPageClient() {
  const { language } = useLanguage()
  const text = copy[language]
  const [password, setPassword] = useState('')
  const [dataset, setDataset] = useState<JournalDataset | null>(null)
  const [error, setError] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [activeType, setActiveType] = useState<JournalType>('daily')
  const [activeSlug, setActiveSlug] = useState('')

  useEffect(() => {
    const initial = getInitialHash()
    setActiveType(initial.type)
    setActiveSlug(initial.slug)

    const syncFromHash = () => {
      const next = getInitialHash()
      setActiveType(next.type)
      setActiveSlug(next.slug)
    }

    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const entriesByType = useMemo(() => {
    const grouped = {
      daily: [] as JournalEntry[],
      weekly: [] as JournalEntry[],
      monthly: [] as JournalEntry[],
      yearly: [] as JournalEntry[],
    }

    dataset?.entries.forEach((entry) => {
      grouped[entry.type].push(entry)
    })

    return grouped
  }, [dataset])

  const entries = entriesByType[activeType]
  const selectedEntry = entries.find((entry) => entry.slug === activeSlug) || entries[0] || null
  const activeTypeIndex = typeOrder.indexOf(activeType)
  const relatedPreview = selectedEntry?.related.slice(0, 8) ?? []
  const relatedOverflow = selectedEntry
    ? Math.max(selectedEntry.related.length - relatedPreview.length, 0)
    : 0
  const passwordInputId = 'journal-password'
  const passwordHintId = 'journal-password-hint'
  const passwordErrorId = 'journal-password-error'

  useEffect(() => {
    if (!dataset || !selectedEntry) {
      return
    }

    const nextHash = `#${selectedEntry.type}/${selectedEntry.slug}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
  }, [dataset, selectedEntry])

  useEffect(() => {
    if (!dataset || !selectedEntry) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scrollActiveCard = (behavior: ScrollBehavior) => {
      const activeCard = document.querySelector<HTMLElement>('[data-journal-active-entry="true"]')
      const strip = activeCard?.closest('.journal-entry-strip') as HTMLElement | null

      if (!activeCard || !strip) {
        return
      }

      if (activeCard.offsetLeft < strip.clientWidth * 0.4) {
        strip.scrollTo({ left: 0, behavior })
        return
      }

      activeCard.scrollIntoView({
        behavior,
        block: 'nearest',
        inline: 'center',
      })
    }

    scrollActiveCard(prefersReducedMotion ? 'auto' : 'smooth')

    const syncAfterResize = () => scrollActiveCard('auto')
    window.addEventListener('resize', syncAfterResize)
    return () => window.removeEventListener('resize', syncAfterResize)
  }, [dataset, selectedEntry])

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!password.trim()) {
      return
    }

    setUnlocking(true)
    setError('')

    try {
      const response = await fetch('/journal-data/payload.json', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('missing-payload')
      }

      const encrypted = (await response.json()) as EncryptedPayload
      const decrypted = await decryptPayload(encrypted, password)
      const initial = getInitialHash()
      setDataset(decrypted)
      setActiveType(initial.type)
      setActiveSlug(initial.slug)
      setPassword('')
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      })
    } catch (unlockError) {
      const message = unlockError instanceof Error ? unlockError.message : ''
      if (message === 'missing-payload') {
        setError(text.missingPayload)
      } else if (message === 'unsupported-crypto') {
        setError(text.unsupportedCrypto)
      } else {
        setError(text.wrongPassword)
      }
    } finally {
      setUnlocking(false)
    }
  }

  const selectType = (type: JournalType) => {
    const firstEntry = entriesByType[type][0]
    setActiveType(type)
    setActiveSlug(firstEntry?.slug || '')
    window.history.replaceState(null, '', firstEntry ? `#${type}/${firstEntry.slug}` : `#${type}`)
  }

  const selectEntry = (entry: JournalReference) => {
    setActiveType(entry.type)
    setActiveSlug(entry.slug)
    window.history.replaceState(null, '', `#${entry.type}/${entry.slug}`)
  }

  const lockJournal = () => {
    setDataset(null)
    setPassword('')
    setError('')
    window.history.replaceState(null, '', '/journal')
  }

  if (!dataset) {
    return (
      <div className="relative min-h-screen overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-gray-200/60 blur-3xl dark:bg-white/10" />
          <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-gray-100 blur-3xl dark:bg-gray-800/80" />
        </div>

        <section className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.62fr)] lg:items-center">
          <div className="animate-slide-up">
            <p className="text-xs uppercase tracking-[0.34em] text-gray-500 dark:text-gray-400">
              {text.lockedKicker}
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-light tracking-tight text-gray-950 dark:text-gray-50 sm:text-7xl lg:text-8xl">
              {text.lockedTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
              {text.lockedBody}
            </p>
          </div>

          <form
            onSubmit={handleUnlock}
            className="animate-scale-in rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-8"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-white/80 text-gray-950 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
              <LockKeyhole className="h-7 w-7" />
            </div>

            <label
              htmlFor={passwordInputId}
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {text.passwordLabel}
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 transition focus-within:border-gray-900 dark:border-white/10 dark:bg-black/20 dark:focus-within:border-white">
              <KeyRound className="h-5 w-5 text-gray-400" />
              <input
                id={passwordInputId}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={text.passwordPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-base text-gray-950 outline-none placeholder:text-gray-400 dark:text-white"
                autoComplete="current-password"
                autoFocus
                aria-invalid={Boolean(error)}
                aria-describedby={`${passwordHintId}${error ? ` ${passwordErrorId}` : ''}`}
              />
            </div>

            {error && (
              <div
                id={passwordErrorId}
                role="alert"
                className="mt-4 flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!password.trim() || unlocking}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-6 py-3.5 text-sm font-medium text-white shadow-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-gray-950"
            >
              {unlocking ? text.unlocking : text.unlock}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p
              id={passwordHintId}
              className="mt-5 flex gap-2 text-sm leading-6 text-gray-500 dark:text-gray-400"
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" />
              {text.privacyNote}
            </p>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="journal-page relative min-h-screen overflow-hidden px-4 pb-20 pt-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-24 h-[30rem] w-[30rem] rounded-full bg-gray-200/70 blur-3xl dark:bg-white/10" />
        <div className="absolute right-[-10rem] top-1/3 h-[34rem] w-[34rem] rounded-full bg-stone-100 blur-3xl dark:bg-gray-900" />
        <div className="absolute left-1/2 top-[30rem] h-64 w-[44rem] -translate-x-1/2 rounded-full bg-white/80 blur-3xl dark:bg-white/[0.04]" />
      </div>

      <section className="relative mx-auto max-w-7xl">
        <button
          type="button"
          onClick={lockJournal}
          aria-label={text.lock}
          title={text.lock}
          className="absolute right-0 top-0 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 text-gray-700 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-gray-400 hover:text-gray-950 dark:border-white/10 dark:bg-white/[0.08] dark:text-gray-200 dark:hover:border-white/30 dark:hover:text-white"
        >
          <LockKeyhole className="h-4 w-4" />
        </button>

        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-slide-up">
            <p className="text-xs uppercase tracking-[0.34em] text-gray-500 dark:text-gray-400">
              {text.unlockedKicker}
            </p>
            <h1 className="mx-auto mt-4 max-w-4xl font-serif text-4xl font-light tracking-tight text-gray-950 dark:text-gray-50 sm:text-5xl lg:text-6xl">
              {text.unlockedTitle}
            </h1>
          </div>
        </div>

        <div
          role="tablist"
          aria-label={text.unlockedTitle}
          className="journal-segmented-control relative mx-auto mt-8 grid max-w-3xl grid-cols-4 overflow-hidden rounded-full border border-black/10 bg-white/[0.64] p-1.5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]"
          style={{ '--journal-active-index': activeTypeIndex } as CSSProperties}
        >
          <div
            aria-hidden="true"
            className="journal-segmented-pill absolute bottom-1.5 left-1.5 top-1.5 rounded-full bg-gray-950 shadow-[0_18px_55px_rgba(15,23,42,0.22)] dark:bg-white"
          />
          {typeOrder.map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={activeType === type}
              onClick={() => selectType(type)}
              className={`relative z-10 min-h-12 rounded-full px-3 py-2 text-center transition-colors duration-300 sm:px-5 ${
                activeType === type
                  ? 'text-white dark:text-gray-950'
                  : 'text-gray-500 hover:bg-white/80 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
              }`}
            >
              <span className="block text-sm font-semibold">{text.types[type]}</span>
              <span className="mt-0.5 block text-[11px] opacity-70 sm:text-xs">
                {dataset.counts[type] || 0} {text.entries}
              </span>
            </button>
          ))}
        </div>

        <div className="journal-filmstrip-shell mx-auto mt-5 max-w-6xl rounded-[1.75rem] border border-black/10 bg-white/[0.58] p-3 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:p-4">
          <div className="journal-filmstrip-peek" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="journal-filmstrip-panel">
            <div className="flex flex-wrap items-end justify-between gap-4 px-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                  {text.timeline}
                </p>
                <h2 className="mt-1 font-serif text-xl font-semibold text-gray-950 dark:text-white sm:text-2xl">
                  {text.types[activeType]}
                </h2>
              </div>
              <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                {entries.length} {text.entries}
              </span>
            </div>

            {entries.length === 0 ? (
              <div className="mt-4 rounded-[1.5rem] border border-dashed border-gray-300 bg-white/50 p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
                <Sparkles className="mx-auto h-7 w-7 text-gray-400" />
                <h2 className="mt-4 font-serif text-2xl font-semibold">{text.emptyTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {text.emptyBody}
                </p>
              </div>
            ) : (
              <div className="journal-entry-strip mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
                {entries.map((entry, index) => {
                  const isSelected =
                    selectedEntry?.type === entry.type && selectedEntry.slug === entry.slug

                  return (
                    <button
                      key={`${entry.type}-${entry.slug}`}
                      type="button"
                      onClick={() => selectEntry(entry)}
                      data-journal-active-entry={isSelected ? 'true' : undefined}
                      className={`journal-entry-card group w-[14.5rem] flex-none snap-center rounded-[1.2rem] border p-3 text-left transition duration-300 sm:w-[17rem] ${
                        isSelected
                          ? 'border-gray-950 bg-gray-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-white dark:bg-white dark:text-gray-950'
                          : 'border-black/10 bg-white/65 text-gray-950 hover:-translate-y-0.5 hover:border-gray-400 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/30'
                      }`}
                      style={{ animationDelay: `${index * 24}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-xs uppercase tracking-[0.22em] opacity-60">
                              {entry.periodLabel}
                            </p>
                            {entry.sample && (
                              <span className="flex-none rounded-full border border-current/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] opacity-75">
                                {text.sample}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 truncate font-serif text-lg font-semibold leading-tight">
                            {entry.title}
                          </h3>
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 flex-none opacity-40 transition group-hover:translate-x-1 group-hover:opacity-80" />
                      </div>
                      <p className="mt-2 line-clamp-1 text-sm leading-6 opacity-75">
                        {entry.highlight || entry.excerpt}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <section className="journal-reader mx-auto mt-7 max-w-4xl">
          {selectedEntry ? (
            <article
              key={`${selectedEntry.type}-${selectedEntry.slug}`}
              className="journal-article-transition rounded-[2.25rem] border border-black/10 bg-white/[0.76] p-6 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_30px_100px_rgba(0,0,0,0.4)] sm:p-9 lg:p-12"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 dark:border-white/10">
                  <CalendarDays className="h-4 w-4" />
                  {selectedEntry.periodLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 dark:border-white/10">
                  <BookOpen className="h-4 w-4" />
                  {text.types[selectedEntry.type]}
                </span>
                {selectedEntry.sample && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-gray-50 px-3 py-1.5 text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
                    <Sparkles className="h-4 w-4" />
                    {text.sample}
                  </span>
                )}
              </div>

              <h2 className="mx-auto mt-6 max-w-3xl text-center font-serif text-4xl font-light tracking-tight text-gray-950 dark:text-white sm:text-6xl">
                {selectedEntry.title}
              </h2>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={<Clock3 className="h-4 w-4" />}
                  label={text.metricLabels.study}
                  value={formatNumber(
                    selectedEntry.metrics.totalStudyHours ?? selectedEntry.metrics.studyHours,
                    'h',
                  )}
                />
                <MetricCard
                  icon={<Moon className="h-4 w-4" />}
                  label={text.metricLabels.sleep}
                  value={formatNumber(selectedEntry.metrics.sleepHours, 'h')}
                />
                <MetricCard
                  icon={<Target className="h-4 w-4" />}
                  label={text.metricLabels.steps}
                  value={formatNumber(selectedEntry.metrics.steps)}
                />
                <MetricCard
                  icon={<Sparkles className="h-4 w-4" />}
                  label={text.metricLabels.exercise}
                  value={formatNumber(selectedEntry.metrics.exerciseMinutes, 'm')}
                />
              </div>

              {(selectedEntry.highlight || selectedEntry.nextFocus) && (
                <div className="mt-8 grid gap-4 lg:grid-cols-2">
                  {selectedEntry.highlight && (
                    <JournalSignal label={text.highlight} value={selectedEntry.highlight} />
                  )}
                  {selectedEntry.nextFocus && (
                    <JournalSignal label={text.nextFocus} value={selectedEntry.nextFocus} />
                  )}
                </div>
              )}

              <div
                className="journal-content mx-auto mt-10 max-w-[48rem]"
                dangerouslySetInnerHTML={{ __html: selectedEntry.contentHtml }}
              />

              {relatedPreview.length > 0 && (
                <div className="mx-auto mt-12 max-w-[48rem] rounded-[1.75rem] border border-black/10 bg-gray-50/80 p-5 dark:border-white/10 dark:bg-black/20">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                        {text.related}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {text.relatedHint}
                      </p>
                    </div>
                    {relatedOverflow > 0 && (
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                        +{relatedOverflow} {text.moreRelated}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {relatedPreview.map((item) => (
                      <button
                        key={`${item.type}-${item.slug}`}
                        type="button"
                        onClick={() => selectEntry(item)}
                        className="rounded-2xl border border-black/10 bg-white/70 p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-gray-400 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/30"
                      >
                        <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          {text.types[item.type]} · {item.date}
                        </span>
                        <span className="mt-2 block truncate font-serif text-xl font-semibold">
                          {item.title}
                        </span>
                        {item.highlight && (
                          <span className="mt-2 line-clamp-2 block text-sm leading-6 text-gray-500 dark:text-gray-400">
                            {item.highlight}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white/50 p-10 text-center dark:border-white/10 dark:bg-white/[0.04]">
              <Sparkles className="mx-auto h-7 w-7 text-gray-400" />
              <h2 className="mt-4 font-serif text-3xl font-semibold">{text.emptyTitle}</h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400">{text.emptyBody}</p>
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-2xl font-light text-gray-950 dark:text-white">{value}</p>
    </div>
  )
}

function JournalSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-gray-50/80 p-5 dark:border-white/10 dark:bg-black/20">
      <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-3 text-sm leading-7 text-gray-700 dark:text-gray-200">{value}</p>
    </div>
  )
}
