import { getAllCategories, getPostsByCategory } from '@/lib/posts'
import Link from '@/components/TransitionLink'

export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((cat) => ({
    category: cat.category,
  }))
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const decodedCategory = decodeURIComponent(params.category)
  const posts = getPostsByCategory(decodedCategory)

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <header className="mb-16 animate-fade-in">
        <h1 className="font-serif text-5xl font-light mb-6 tracking-tight">
          {decodedCategory}
        </h1>
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
