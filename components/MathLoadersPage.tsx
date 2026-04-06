'use client'

import { useMemo, useState } from 'react'
import MathCurveLoader from '@/components/MathCurveLoader'
import {
  FEATURED_CURVE_IDS,
  getCurveConfigById,
  MathCurveConfig,
  MATH_CURVE_LOADERS,
  TRANSITION_CURVE_IDS,
} from '@/lib/mathCurves'
import { useLanguage } from './LanguageProvider'

function isCurve(value: MathCurveConfig | undefined): value is MathCurveConfig {
  return Boolean(value)
}

export default function MathLoadersPage() {
  const { language, t } = useLanguage()
  const gallery = useMemo(
    () => FEATURED_CURVE_IDS.map((id) => getCurveConfigById(id)).filter(isCurve),
    [],
  )
  const transitionCurves = useMemo(
    () => TRANSITION_CURVE_IDS.map((id) => getCurveConfigById(id)).filter(isCurve),
    [],
  )
  const [selectedId, setSelectedId] = useState(MATH_CURVE_LOADERS[0]?.id ?? 'original-thinking')
  const selectedCurve = getCurveConfigById(selectedId) ?? MATH_CURVE_LOADERS[0]

  if (!selectedCurve) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
      <section className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-[2rem] border border-gray-200/80 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-gray-950/70 dark:shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
            {t('loaders.kicker')}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {t('loaders.title')}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
            {t('loaders.subtitle')}
          </p>
        </div>

        <aside className="rounded-[2rem] border border-gray-200/80 bg-gradient-to-br from-gray-50 to-white p-8 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
            {t('loaders.panel.title')}
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            {t('loaders.panel.body')}
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
            {t('loaders.panel.note')}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {transitionCurves.map((curve) => (
              <span
                key={curve.id}
                className="rounded-full border border-gray-300/70 px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                {curve.name[language]}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="rounded-[2rem] border border-gray-200/80 bg-white p-6 shadow-[0_16px_60px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
                {t('loaders.preview.label')}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
                {selectedCurve.name[language]}
              </h2>
              <p className="mt-2 text-sm uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                {selectedCurve.tag[language]}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-gray-200/70 bg-gradient-to-br from-gray-100 via-white to-gray-50 px-6 py-10 text-slate-950 dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-black dark:text-white">
            <div className="flex items-center justify-center">
              <MathCurveLoader
                curve={selectedCurve}
                className="h-56 w-56 sm:h-72 sm:w-72"
                particleScale={1.18}
                strokeOpacity={0.16}
              />
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-gray-600 dark:text-gray-300">
            {selectedCurve.description[language]}
          </p>
        </div>

        <aside className="rounded-[2rem] border border-gray-200/80 bg-white/80 p-6 dark:border-gray-800 dark:bg-gray-950/80">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
              {t('loaders.preview.formula')}
            </p>
            <pre className="mt-4 overflow-auto rounded-[1.25rem] border border-gray-200 bg-gray-50 p-5 font-mono text-sm leading-7 text-gray-700 dark:border-gray-800 dark:bg-black/40 dark:text-gray-200">
              {selectedCurve.formula.join('\n')}
            </pre>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
              {t('loaders.preview.pool')}
            </p>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
              {t('loaders.preview.tip')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {transitionCurves.map((curve) => (
                <button
                  key={curve.id}
                  type="button"
                  onClick={() => setSelectedId(curve.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    curve.id === selectedId
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950'
                      : 'border-gray-300 text-gray-600 hover:border-gray-500 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {curve.name[language]}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
              {t('loaders.library.label')}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
              {t('loaders.library.note')}
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gallery.map((curve) => (
            <button
              key={curve.id}
              type="button"
              onClick={() => setSelectedId(curve.id)}
              className={`rounded-[1.75rem] border p-5 text-left transition-all duration-300 ${
                curve.id === selectedId
                  ? 'border-gray-900 bg-gray-900 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950'
                  : 'border-gray-200 bg-white hover:-translate-y-1 hover:border-gray-400 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:hover:border-gray-600'
              }`}
            >
              <div className="rounded-[1.4rem] border border-current/10 bg-black/[0.03] px-4 py-6 text-current dark:bg-white/[0.04]">
                <MathCurveLoader
                  curve={curve}
                  className="mx-auto h-32 w-32"
                  particleMode="compact"
                  strokeOpacity={curve.id === selectedId ? 0.18 : 0.12}
                />
              </div>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.22em] opacity-70">
                  {curve.tag[language]}
                </p>
                <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                  {curve.name[language]}
                </h3>
                <p className="mt-3 text-sm leading-7 opacity-80">
                  {curve.description[language]}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
