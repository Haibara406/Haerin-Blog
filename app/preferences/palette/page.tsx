import type { Metadata } from 'next'
import PaletteStudioPage from '@/components/PaletteStudioPage'

export const metadata: Metadata = {
  title: 'Palette Studio',
  description: 'Browse and apply custom blog palettes adapted from Happy Hues.',
}

export default function PreferencesPalettePage() {
  return <PaletteStudioPage />
}
