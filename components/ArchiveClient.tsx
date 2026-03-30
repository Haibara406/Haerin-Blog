'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
  category?: string
}

export default function ArchiveClient({ archive }: { archive: Record<string, Omit<Post, 'content'>[]> }) {
  const { t } = useLanguage()
  const years = Object.keys(archive).sort((a, b) => parseInt(b) - parseInt(a))
  const [selectedYear, setSelectedYear] = useState<string | null>(years[0] || null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleYearClick = (year: string) => {
    if (year === selectedYear || isAnimating) return
    setIsAnimating(true)
    setSelectedYear(year)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const selectedIndex = selectedYear ? years.indexOf(selectedYear) : 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <header className="mb-20 animate-fade-in text-center">
        <h1 className="font-serif text-6xl font-light mb-6 tracking-tight">
          {t('archive.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('archive.subtitle')}
        </p>
      </header>

      {/* Timeline */}
      <div className="mb-20 flex justify-center items-center px-4">
        <div className="relative flex items-center gap-16 sm:gap-20 md:gap-24">
          {/* Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700 top-1/2 -translate-y-1/2"></div>

          {/* Active Indicator - moves along the line */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-900 dark:bg-gray-100 z-20 pointer-events-none transition-all duration-500 ease-in-out"
            style={{
              left: `calc(${selectedIndex * 100 / (years.length - 1)}% - 0.5rem)`,
              transform: `translateY(-50%) scale(${isAnimating ? 1 : 1.5})`,
            }}
          ></div>

          {/* Year Dots */}
          {years.map((year, index) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className="relative z-10 group animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                selectedYear === year
                  ? 'bg-transparent'
                  : 'bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-600 dark:group-hover:bg-gray-400 group-hover:scale-125'
              }`}></div>
              <div className={`absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 ${
                selectedYear === year
                  ? 'text-gray-900 dark:text-gray-100 font-medium text-lg'
                  : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
              }`}>
                <div className="flex flex-col items-center gap-1">
                  <span>{year}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-600">({archive[year].length})</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      {selectedYear && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="space-y-1">
            {archive[selectedYear].map((post, index) => (
              <Link
                key={post.slug}
                href={`/post/${encodeURIComponent(post.slug)}`}
                className="block group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <article className="relative py-6 px-6 border-b border-gray-200 dark:border-gray-800
                                  hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all duration-500">
                  <div className="flex items-start gap-8">
                    <time className="text-sm text-gray-500 dark:text-gray-500 min-w-[80px] pt-1 uppercase tracking-wider">
                      {post.date.slice(5)}
                    </time>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-light mb-2 group-hover:translate-x-2 transition-transform duration-500">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100
                               group-hover:translate-x-2 transition-all duration-500 flex-shrink-0 mt-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                  <div className="absolute left-0 top-0 w-1 h-full bg-gray-900 dark:bg-gray-100
                                scale-y-0 group-hover:scale-y-100 transition-transform duration-500
                                origin-top"></div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}