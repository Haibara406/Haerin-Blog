import { NextRequest, NextResponse } from 'next/server'
import { getPostsByTag } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tag = searchParams.get('tag')

  if (!tag) {
    return NextResponse.json({ error: 'Tag parameter is required' }, { status: 400 })
  }

  const posts = getPostsByTag(tag)
  return NextResponse.json(posts)
}
