'use client'

import { useLanguage } from './LanguageProvider'

interface PostHeaderProps {
  title: string
  date: string
  updated?: string
  category?: string
  excerpt?: string
  tags?: string[]
  readingTime?: number
  wordCount?: number
}

export default function PostHeader({
  title,
  date,
  updated,
  category,
  excerpt,
  tags,
  readingTime,
  wordCount,
}: PostHeaderProps) {
  const { t } = useLanguage()

  return (
    <header className="mb-16 sm:mb-20 animate-fade-in">
      {/* 元数据 - 更精致的排版 */}
      <div className="mb-6 sm:mb-8 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <time className="font-medium">
          {t('post.published')}: {date}
        </time>
        {updated && (
          <>
            <span className="opacity-30">·</span>
            <time className="font-medium">
              {t('post.updated')}: {updated}
            </time>
          </>
        )}
        {category && (
          <>
            <span className="opacity-30">·</span>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              {category}
            </span>
          </>
        )}
        {readingTime && (
          <>
            <span className="opacity-30">·</span>
            <span>{readingTime} {t('post.minRead')}</span>
          </>
        )}
        {wordCount && (
          <>
            <span className="opacity-30">·</span>
            <span>{wordCount.toLocaleString()} {t('post.words')}</span>
          </>
        )}
      </div>

      {/* 标题 - 更大胆的排版 */}
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-6 sm:mb-8 tracking-tight leading-[1.1] text-balance">
        {title}
      </h1>

      {/* 摘要 - 更优雅的样式 */}
      {excerpt && (
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-3xl font-light">
          {excerpt}
        </p>
      )}

      {/* 标签 - 恢复简单样式 */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-200 dark:border-gray-800">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  )
}
