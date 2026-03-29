'use client'

import { useState } from 'react'
import BlogCard from '@/components/BlogCard'
import { useLanguage } from '@/components/LanguageProvider'

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
  category?: string
}

const POSTS_PER_PAGE = 10

export default function HomeClient({ posts }: { posts: Omit<Post, 'content'>[] }) {
  const { t } = useLanguage()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = posts.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Hero Section */}
      <section className="mb-20 sm:mb-32 animate-fade-in">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-4 sm:mb-6 tracking-tight leading-tight whitespace-pre-line">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section>
        <h2 className="font-serif text-2xl sm:text-3xl font-light mb-8 sm:mb-12 tracking-tight">
          {t('home.recent')}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {currentPosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800
                       hover:border-gray-300 dark:hover:border-gray-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← {t('pagination.prev')}
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800
                       hover:border-gray-300 dark:hover:border-gray-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('pagination.next')} →
            </button>
          </div>
        )}
      </section>
    </div>
  )
}