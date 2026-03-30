'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
}

export default function BlogCard({ post, index }: { post: Post; index: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={cardRef}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <Link href={`/post/${encodeURIComponent(post.slug)}`}>
        <article className="group relative py-8 pl-4 border-b border-gray-200 dark:border-gray-800
                           hover:bg-gray-50 dark:hover:bg-gray-900/30
                           transition-all duration-500">
          <div className="flex items-start gap-12">
            {/* Index */}
            <span className="text-5xl font-light text-gray-200 dark:text-gray-800
                           group-hover:text-gray-300 dark:group-hover:text-gray-700
                           transition-colors duration-500 select-none pt-2 w-20 flex-shrink-0">
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-8">
              <time className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                {post.date}
              </time>
              <h3 className="font-serif text-3xl font-light mt-2 mb-3 tracking-tight
                           group-hover:translate-x-2 transition-transform duration-500">
                {post.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {post.excerpt}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-500">
                  {post.tags.map((tag, tagIndex) => (
                    <span
                      key={tag}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ transitionDelay: `${tagIndex * 50}ms` }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Arrow */}
            <svg
              className="w-6 h-6 text-gray-400 opacity-0 group-hover:opacity-100
                       group-hover:translate-x-2 transition-all duration-500 flex-shrink-0 mt-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>

          {/* Hover indicator */}
          <div className="absolute left-0 top-0 w-1 h-full bg-gray-900 dark:bg-gray-100
                        scale-y-0 group-hover:scale-y-100 transition-transform duration-500
                        origin-top"></div>
        </article>
      </Link>
    </div>
  )
}
