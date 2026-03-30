import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import ReadingProgress from '@/components/ReadingProgress'
import BackButton from '@/components/BackButton'
import TableOfContents from '@/components/TableOfContents'
import BackToTop from '@/components/BackToTop'
import Comments from '@/components/Comments'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function Post({ params }: { params: { slug: string } }) {
  // 解码 URL 编码的 slug（处理中文文件名）
  const decodedSlug = decodeURIComponent(params.slug)
  const post = getPostBySlug(decodedSlug)

  if (!post) {
    notFound()
  }

  return (
    <>
      <ReadingProgress />
      <BackToTop />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="flex gap-8">
          {/* 主内容区 */}
          <article className="flex-1 min-w-0">
            <BackButton />

            {/* Article Header */}
            <header className="mb-12 sm:mb-16 animate-fade-in">
              <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <time className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  发布: {post.date}
                </time>
                {post.updated && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <time className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      更新: {post.updated}
                    </time>
                  </>
                )}
                {post.category && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {post.category}
                    </span>
                  </>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 tracking-tight leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-2">
                {post.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full
                             hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            {/* Article Content */}
            <div
              className="prose prose-sm sm:prose-base animate-slide-up max-w-none"
              style={{ animationDelay: '200ms' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Comments */}
            <Comments />
          </article>

          {/* 目录侧边栏 */}
          <TableOfContents content={post.content} />
        </div>
      </div>
    </>
  )
}
