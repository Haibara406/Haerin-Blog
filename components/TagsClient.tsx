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
    if (ratio > 0.7) return 'text-4xl'
    if (ratio > 0.4) return 'text-3xl'
    if (ratio > 0.2) return 'text-2xl'
    return 'text-xl'
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
          {tags.length} tags · {totalArticles} {t('tags.articles')}
        </p>
      </header>

      <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 max-w-5xl mx-auto">
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
    </div>
  )
}