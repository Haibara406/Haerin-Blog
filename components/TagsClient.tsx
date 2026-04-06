'use client'

import { useState, useMemo } from 'react'
import Link from '@/components/TransitionLink'
import { useLanguage } from '@/components/LanguageProvider'

interface Tag {
  tag: string
  count: number
}

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
}

const POSTS_PER_PAGE = 10

export default function TagsClient({ tags, allPosts }: { tags: Tag[]; allPosts: Post[] }) {
  const { t, language } = useLanguage()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  // 客户端过滤文章
  const filteredPosts = useMemo(() => {
    if (!selectedTag) return []
    return allPosts.filter((post) => post.tags?.includes(selectedTag))
  }, [selectedTag, allPosts])

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null)
      setCurrentPage(1)
    } else {
      setSelectedTag(tag)
      setCurrentPage(1)
    }
  }

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

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
          <button
            key={tag.tag}
            onClick={() => handleTagClick(tag.tag)}
            className={`animate-scale-in group ${
              selectedTag === tag.tag ? 'opacity-100' : ''
            }`}
            style={{
              animationDelay: `${index * 30}ms`,
              opacity: selectedTag === tag.tag ? 1 : getTagOpacity(tag.count),
            }}
          >
            <div
              className={`${getTagSize(tag.count)} font-light transition-all duration-300
                         hover:scale-110 hover:opacity-100 cursor-pointer
                         ${
                           selectedTag === tag.tag
                             ? 'text-gray-900 dark:text-gray-100'
                             : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                         }`}
            >
              <span className={selectedTag === tag.tag ? 'underline underline-offset-4' : 'group-hover:underline underline-offset-4'}>
                {tag.tag}
              </span>
              <span className="text-sm ml-2 text-gray-400 dark:text-gray-600">
                {tag.count}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedTag && (
        <div className="mt-16 max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">
              # {selectedTag}
            </h2>
            <button
              onClick={() => {
                setSelectedTag(null)
                setCurrentPage(1)
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>

          <div className="space-y-6">
            {currentPosts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/post/${post.slug}`}
                className="block group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <article className="py-6 border-b border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {post.date}
                  </time>
                  <h3 className="text-xl font-light mt-2 mb-2 text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {post.excerpt}
                  </p>
                </article>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← {t('common.prev')}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {t('common.next')} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
