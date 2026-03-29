'use client'

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

export default function HomeClient({ posts }: { posts: Omit<Post, 'content'>[] }) {
  const { t } = useLanguage()

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
          {posts.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>
    </div>
  )
}