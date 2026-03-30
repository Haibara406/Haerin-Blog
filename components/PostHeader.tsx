'use client'

import { useLanguage } from './LanguageProvider'

interface PostHeaderProps {
  title: string
  date: string
  updated?: string
  category?: string
  excerpt?: string
  tags?: string[]
}

export default function PostHeader({
  title,
  date,
  updated,
  category,
  excerpt,
  tags,
}: PostHeaderProps) {
  const { t } = useLanguage()

  return (
    <header className="mb-12 sm:mb-16 animate-fade-in">
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
        <time className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {t('post.published')}: {date}
        </time>
        {updated && (
          <>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <time className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('post.updated')}: {updated}
            </time>
          </>
        )}
        {category && (
          <>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {category}
            </span>
          </>
        )}
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 tracking-tight leading-tight">
        {title}
      </h1>
      {excerpt && (
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
          {excerpt}
        </p>
      )}
      <div className="mt-6 sm:mt-8 flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full
                     hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </header>
  )
}
