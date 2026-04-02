import type { Metadata } from 'next'
import CosmosExperience from '@/components/CosmosExperience'

export const metadata: Metadata = {
  title: 'Cosmos',
  description: 'Interactive voxel planets inspired by the Voxels generative scene',
}

export default function CosmosPage() {
  return <CosmosExperience />
}
