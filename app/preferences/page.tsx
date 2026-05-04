import type { Metadata } from 'next'
import PreferencesClient from '@/components/PreferencesClient'

export const metadata: Metadata = {
  title: 'Preferences',
  description: 'Personalize the blog theme, typography, loading motion, and reading surface.',
}

export default function PreferencesPage() {
  return <PreferencesClient />
}
