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
  const [isHovered, setIsHovered] = useState(false)
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
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Link href={`/post/${post.slug}`}>
        <article
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative p-8 rounded-lg border border-gray-200 dark:border-gray-800
                     hover:border-gray-300 dark:hover:border-gray-700
                     transition-all duration-500 ease-out
                     hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          style={{
            transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <time className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {post.date}
          </time>
          <h3 className="font-serif text-2xl font-light mt-3 mb-3 tracking-tight
                         transition-all duration-300"
              style={{
                opacity: isHovered ? 0.7 : 1,
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              }}>
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 transition-colors duration-300">
            {post.excerpt}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag, tagIndex) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded
                           transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  style={{
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                    transitionDelay: isHovered ? `${tagIndex * 50}ms` : '0ms',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </Link>
    </div>
  )
}
