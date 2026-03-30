import { getAllTags, getAllPosts } from '@/lib/posts'
import TagsClient from '@/components/TagsClient'

export default function TagsPage() {
  const tags = getAllTags()
  const allPosts = getAllPosts()

  return <TagsClient tags={tags} allPosts={allPosts} />
}