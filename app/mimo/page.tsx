import type { Metadata } from 'next'
import MimoPageClient from '@/components/MimoPageClient'

export const metadata: Metadata = {
  title: 'MiMo Interactive',
  description: 'Interactive flip card with draggable text string effects.',
}

export default function MimoPage() {
  return <MimoPageClient />
}
