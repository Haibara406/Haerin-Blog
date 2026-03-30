'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

interface Tag {
  tag: string
  count: number
}

export default function TagsClient({ tags }: { tags: Tag[] }) {
  const { t } = useLanguage()
  const maxCount = Math.max(...tags.map((t) => t.count))

  const getTagSize = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.7) return 'text-3xl'
    if (ratio > 0.4) return 'text-2xl'
    if (ratio > 0.2) return 'text-xl'
    return 'text-lg'
  }

  const getTagOpacity = (count: number) => {
    const ratio = count / maxCount
    return 0.5 + ratio * 0.5
  }

  const totalArticles = tags.reduce((sum, tag) => sum + tag.count, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <header className="mb-16 animate-fade-in text-center">
        <h1 className="font-serif text-5xl sm:text-6xl font-light mb-6 tracking-tight">
          {t('tags.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {tags.length} {t('tags.articles')}, {totalArticles} {t('tags.articles')}
        </p>
      </header>

      <div className="flex flex-wrap justify-center items-center gap-6 mb-20">
        {tags.map((tag, index) => (
          <Link
            key={tag.tag}
            href={`/tags/${encodeURIComponent(tag.tag)}`}
            className="animate-scale-in group"
            style={{
              animationDelay: `${index * 30}ms`,
              opacity: getTagOpacity(tag.count),
            }}
          >
            <div
              className={`${getTagSize(tag.count)} font-light transition-all duration-300
                         hover:scale-110 hover:opacity-100 cursor-pointer
                         text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100`}
            >
              <span className="group-hover:underline underline-offset-4">{tag.tag}</span>
              <span className="text-sm ml-2 text-gray-400 dark:text-gray-600">
                {tag.count}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="max-w-5xl mx-auto">
        <h2 className="font-serif text-3xl font-light mb-12 tracking-tight text-center">
          {t('tags.all')}
        </h2>
        <div className="space-y-0">
          {tags.map((tag, index) => (
            <Link
              key={tag.tag}
              href={`/tags/${encodeURIComponent(tag.tag)}`}
              className="animate-slide-up group block"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center justify-between py-6 px-8
                           border-b border-gray-200 dark:border-gray-800
                           hover:bg-gray-50 dark:hover:bg-gray-900/30
                           transition-all duration-300 relative overflow-hidden">
                {/* Index */}
                <div className="flex items-center gap-8 flex-1">
                  <span className="text-4xl font-light text-gray-200 dark:text-gray-800
                                 group-hover:text-gray-300 dark:group-hover:text-gray-700
                                 transition-colors duration-300 select-none w-16">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Tag name */}
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl text-gray-400 dark:text-gray-600
                                   group-hover:text-gray-500 dark:group-hover:text-gray-500
                                   transition-colors duration-300">#</span>
                    <span className="text-2xl font-light group-hover:translate-x-2
                                   transition-transform duration-300">
                      {tag.tag}
                    </span>
                  </div>
                </div>

                {/* Count */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-3xl font-light">{tag.count}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      {t('tags.articles')}
                    </div>
                  </div>

                  <svg
                    className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100
                             group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                {/* Hover indicator */}
                <div className="absolute left-0 top-0 w-1 h-full bg-gray-900 dark:bg-gray-100
                              scale-y-0 group-hover:scale-y-100 transition-transform duration-300
                              origin-top"></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}