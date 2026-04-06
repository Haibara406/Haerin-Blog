'use client'

import { useState, useEffect } from 'react'
import Link from '@/components/TransitionLink'

interface SearchResult {
  slug: string
  title: string
  excerpt: string
  date: string
  tags?: string[]
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text

  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-gray-100">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [allPosts, setAllPosts] = useState<SearchResult[]>([])

  useEffect(() => {
    // 加载所有文章数据
    fetch('/api/search')
      .then((res) => res.json())
      .then((data) => setAllPosts(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchQuery = query.toLowerCase()
    const filtered = allPosts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(searchQuery)
      const excerptMatch = post.excerpt.toLowerCase().includes(searchQuery)
      const tagsMatch = post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery))
      return titleMatch || excerptMatch || tagsMatch
    })

    setResults(filtered)
  }, [query, allPosts])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-gray-900
                   animate-scale-in overflow-hidden border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文章..."
              autoFocus
              className="flex-1 text-2xl bg-transparent border-none outline-none font-light
                       text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              没有找到相关文章
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {results.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/post/${post.slug}`}
                  onClick={onClose}
                  className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50
                           transition-all duration-300 group relative"
                >
                  <div className="flex items-start gap-6">
                    <span className="text-4xl font-light text-gray-200 dark:text-gray-800
                                   group-hover:text-gray-300 dark:group-hover:text-gray-700
                                   transition-colors select-none">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-light mb-2 group-hover:translate-x-1 transition-transform duration-300">
                        {highlightText(post.title, query)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {highlightText(post.excerpt, query)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <time>{post.date}</time>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag}>
                                #{highlightText(tag, query)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-0 top-0 w-0.5 h-full bg-gray-900 dark:bg-gray-100
                                scale-y-0 group-hover:scale-y-100 transition-transform duration-300
                                origin-top"></div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">ESC</kbd>
            <span>关闭</span>
          </div>
          {results.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {results.length} 个结果
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
