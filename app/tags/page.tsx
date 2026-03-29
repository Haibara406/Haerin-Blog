import { getAllTags } from '@/lib/posts'
import TagsClient from '@/components/TagsClient'

export default function TagsPage() {
  const tags = getAllTags()

  return <TagsClient tags={tags} />
}