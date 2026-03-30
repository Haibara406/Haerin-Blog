import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import ReadingProgress from '@/components/ReadingProgress'
import BackButton from '@/components/BackButton'
import TableOfContents from '@/components/TableOfContents'
import BackToTop from '@/components/BackToTop'
import Comments from '@/components/Comments'
import PostHeader from '@/components/PostHeader'
import CodeBlock from '@/components/CodeBlock'
import ImageLightbox from '@/components/ImageLightbox'
import ShareButtons from '@/components/ShareButtons'
import JsonLd from '@/components/JsonLd'
import MermaidRenderer from '@/components/MermaidRenderer'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug)
  const post = getPostBySlug(decodedSlug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: 'Haerin' }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: ['Haerin'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

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
      <JsonLd
        type="article"
        data={{
          title: post.title,
          description: post.excerpt,
          url: `/post/${encodeURIComponent(post.slug)}`,
          datePublished: post.date,
          dateModified: post.updated,
          author: 'Haerin',
          keywords: post.tags,
        }}
      />
      <ReadingProgress />
      <BackToTop />
      <CodeBlock />
      <ImageLightbox />
      <MermaidRenderer />

      {/* 优雅的容器布局 */}
      <div className="article-layout">
        {/* 左侧装饰线 */}
        <div className="article-decoration-left" />

        {/* 主容器 */}
        <div className="article-container">
          {/* 内容区域 */}
          <div className="article-content-wrapper">
            {/* 主内容 */}
            <article className="article-main">
              <BackButton />

              {/* Article Header */}
              <PostHeader
                title={post.title}
                date={post.date}
                updated={post.updated}
                category={post.category}
                excerpt={post.excerpt}
                tags={post.tags}
                readingTime={post.readingTime}
                wordCount={post.wordCount}
              />

              {/* Article Content */}
              <div
                className="prose prose-sm sm:prose-base lg:prose-lg animate-slide-up"
                style={{ animationDelay: '200ms' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Share Buttons */}
              <ShareButtons
                title={post.title}
                url={`/post/${encodeURIComponent(post.slug)}`}
              />

              {/* Comments */}
              <Comments />
            </article>

            {/* 目录侧边栏 - 优化样式 */}
            <TableOfContents content={post.content} />
          </div>
        </div>

        {/* 右侧装饰线 */}
        <div className="article-decoration-right" />
      </div>
    </>
  )
}
