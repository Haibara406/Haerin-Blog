import { getAllPosts, getPostBySlug } from './posts'

export function getBlogStats() {
  const posts = getAllPosts()

  // 计算总字数 - 读取实际内容
  const totalWords = posts.reduce((sum, post) => {
    const fullPost = getPostBySlug(post.slug)
    if (!fullPost) return sum

    // 移除 HTML 标签，计算纯文本字数
    const textContent = fullPost.content
      .replace(/<[^>]*>/g, '') // 移除 HTML 标签
      .replace(/\s+/g, ' ') // 合并空白字符
      .trim()

    // 中文字符和英文单词混合计数
    const chineseChars = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = (textContent.match(/[a-zA-Z]+/g) || []).length

    return sum + chineseChars + englishWords
  }, 0)

  // 计算总标签数
  const allTags = new Set<string>()
  posts.forEach(post => {
    post.tags?.forEach(tag => allTags.add(tag))
  })

  return {
    totalPosts: posts.length,
    totalWords: Math.round(totalWords / 1000) * 1000, // 四舍五入到千位
    totalTags: allTags.size,
    totalCategories: new Set(posts.map(p => p.category)).size,
  }
}