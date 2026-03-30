import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import ReadingProgress from '@/components/ReadingProgress'
import BackButton from '@/components/BackButton'
import TableOfContents from '@/components/TableOfContents'
import BackToTop from '@/components/BackToTop'
import Comments from '@/components/Comments'
import PostHeader from '@/components/PostHeader'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function Post({ params }: { params: { slug: string } }) {
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
            <PostHeader
              title={post.title}
              date={post.date}
              updated={post.updated}
              category={post.category}
              excerpt={post.excerpt}
              tags={post.tags}
            />

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
