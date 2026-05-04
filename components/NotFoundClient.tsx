'use client'

import { ArrowLeft, Compass, Home, LockKeyhole } from 'lucide-react'
import MathCurveLoader from '@/components/MathCurveLoader'
import Link from '@/components/TransitionLink'
import { getCurveConfigById } from '@/lib/mathCurves'
import { useLanguage } from '@/components/LanguageProvider'

const copy = {
  en: {
    kicker: '404 / Lost Signal',
    title: 'This page slipped out of orbit.',
    body: 'The address may have changed, or the note may have never been published. Let us take the scenic route back.',
    home: 'Back Home',
    journal: 'Private Journal',
    archive: 'Archive',
  },
  zh: {
    kicker: '404 / 信号迷路',
    title: '这个页面暂时脱离了轨道。',
    body: '地址可能已经变化，或者这篇内容从未公开。先沿着一条更稳的路径回去吧。',
    home: '回到首页',
    journal: '私密日志',
    archive: '文章归档',
  },
}

export default function NotFoundClient() {
  const { language } = useLanguage()
  const text = copy[language]
  const curve = getCurveConfigById('lemniscate-bloom')

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gray-200/70 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-gray-100 blur-3xl dark:bg-gray-900" />
      </div>

      <section className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
        <div className="animate-slide-up">
          <p className="text-xs uppercase tracking-[0.34em] text-gray-500 dark:text-gray-400">
            {text.kicker}
          </p>
          <div className="mt-6 flex items-end gap-5">
            <h1 className="font-serif text-[7rem] font-light leading-none tracking-tight text-gray-950 dark:text-white sm:text-[11rem]">
              404
            </h1>
            <Compass className="mb-5 h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl font-light tracking-tight text-gray-950 dark:text-white sm:text-6xl">
            {text.title}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
            {text.body}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-medium text-white shadow-xl transition hover:-translate-y-0.5 dark:bg-white dark:text-gray-950"
            >
              <Home className="h-4 w-4" />
              {text.home}
            </Link>
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-6 py-3 text-sm font-medium text-gray-900 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-gray-400 dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
            >
              <LockKeyhole className="h-4 w-4" />
              {text.journal}
            </Link>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-6 py-3 text-sm font-medium text-gray-900 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-gray-400 dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {text.archive}
            </Link>
          </div>
        </div>

        {curve && (
          <div className="animate-scale-in rounded-[2.5rem] border border-black/10 bg-white/60 p-8 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
            <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-black/10 bg-gradient-to-br from-gray-50 to-white text-gray-950 dark:border-white/10 dark:from-white/[0.08] dark:to-transparent dark:text-white">
              <MathCurveLoader
                curve={curve}
                className="h-56 w-56"
                particleScale={1.18}
                strokeOpacity={0.15}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
