import { getAllTags, getPostsByTag } from '@/lib/posts'
import Link from 'next/link'

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({
    tag: tag.tag,
  }))
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const decodedTag = decodeURIComponent(params.tag)
  const posts = getPostsByTag(decodedTag)

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <header className="mb-16 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">#</span>
          <h1 className="font-serif text-5xl font-light tracking-tight">
            {decodedTag}
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {posts.length} 篇文章
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/post/${post.slug}`}
            className="block animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <article className="p-6 rounded-lg border border-gray-200 dark:border-gray-800
                             hover:border-gray-300 dark:hover:border-gray-700
                             transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <time className="text-sm text-gray-500 dark:text-gray-400">
                {post.date}
              </time>
              <h2 className="font-serif text-2xl font-light mt-3 mb-3 tracking-tight">
                {post.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {post.excerpt}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}