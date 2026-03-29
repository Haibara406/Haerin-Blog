'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl
                   animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章..."
            autoFocus
            className="w-full text-lg bg-transparent border-none outline-none
                     text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query && results.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              没有找到相关文章
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((post) => (
                <Link
                  key={post.slug}
                  href={`/post/${post.slug}`}
                  onClick={onClose}
                  className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                           transition-colors duration-200"
                >
                  <h3 className="font-medium mb-1">
                    {highlightText(post.title, query)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {highlightText(post.excerpt, query)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      {post.date}
                    </time>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded"
                          >
                            {highlightText(tag, query)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
          <span>按 ESC 关闭</span>
          <span>{results.length} 个结果</span>
        </div>
      </div>
    </div>
  )
}