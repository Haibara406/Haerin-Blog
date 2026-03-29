import { getArchive } from '@/lib/posts'
import ArchiveClient from '@/components/ArchiveClient'

export default function Archive() {
  const archive = getArchive()

  return <ArchiveClient archive={archive} />
}