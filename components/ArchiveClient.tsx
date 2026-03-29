'use client'

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

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <header className="mb-16 animate-fade-in">
        <h1 className="font-serif text-6xl font-light mb-6 tracking-tight">
          {t('archive.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('archive.subtitle')}
        </p>
      </header>

      <div className="space-y-12">
        {years.map((year, yearIndex) => (
          <section
            key={year}
            className="animate-slide-up"
            style={{ animationDelay: `${yearIndex * 100}ms` }}
          >
            <h2 className="font-serif text-3xl font-light mb-6 tracking-tight">
              {year}
            </h2>
            <div className="space-y-6">
              {archive[year].map((post) => (
                <Link
                  key={post.slug}
                  href={`/post/${post.slug}`}
                  className="block group"
                >
                  <article className="flex gap-6 items-start hover:translate-x-2 transition-transform duration-300">
                    <time className="text-sm text-gray-500 dark:text-gray-400 min-w-[80px] pt-1">
                      {post.date.slice(5)}
                    </time>
                    <div className="flex-1">
                      <h3 className="text-xl font-light mb-2 group-hover:opacity-60 transition-opacity duration-200">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}