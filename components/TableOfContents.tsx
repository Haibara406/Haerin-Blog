'use client'

import { useEffect, useRef, useState } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
  children: TOCItem[]
}

export default function TableOfContents({ content }: { content: string }) {
  const [toc, setToc] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const tocListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 从内容中提取所有标题 (h1-h6)
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6'
      )
    ).filter((heading) => heading.id)

    // 构建树形结构
    const buildTree = (headings: Element[]): TOCItem[] => {
      const root: TOCItem[] = []
      const stack: TOCItem[] = []

      headings.forEach((heading) => {
        const level = parseInt(heading.tagName[1])
        const item: TOCItem = {
          id: heading.id,
          text: heading.textContent || '',
          level,
          children: []
        }

        // 找到合适的父节点
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop()
        }

        if (stack.length === 0) {
          root.push(item)
        } else {
          stack[stack.length - 1].children.push(item)
        }

        stack.push(item)
      })

      return root
    }

    const tree = buildTree(headings)
    setToc(tree)
    if (headings.length === 0) {
      setActiveId('')
      return
    }

    const updateActiveHeading = () => {
      const offset = 140
      let currentActiveId = headings[0].id

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - offset <= 0) {
          currentActiveId = heading.id
        } else {
          break
        }
      }

      setActiveId(currentActiveId)
    }

    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        updateActiveHeading()
        ticking = false
      })
    }

    updateActiveHeading()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [content])

  useEffect(() => {
    if (!activeId) return
    const container = tocListRef.current
    if (!container) return

    const activeButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[data-toc-id]')
    ).find((button) => button.dataset.tocId === activeId)

    if (!activeButton) return

    const containerRect = container.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()
    const outOfView =
      buttonRect.top < containerRect.top || buttonRect.bottom > containerRect.bottom

    if (outOfView) {
      activeButton.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeId])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newCollapsed = new Set(collapsed)
    if (newCollapsed.has(id)) {
      newCollapsed.delete(id)
    } else {
      newCollapsed.add(id)
    }
    setCollapsed(newCollapsed)
  }

  const renderTOCItem = (item: TOCItem, depth: number = 0) => {
    const hasChildren = item.children.length > 0
    const isCollapsed = collapsed.has(item.id)
    const isActive = activeId === item.id

    // 限制缩进深度，避免六级标题缩进过多
    const maxDepth = 3
    const effectiveDepth = Math.min(depth, maxDepth)

    return (
      <li key={item.id} className="relative">
        <div className="flex items-start group">
          {/* 折叠/展开按钮 */}
          {hasChildren && (
            <button
              onClick={(e) => toggleCollapse(item.id, e)}
              className="flex-shrink-0 w-4 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* 标题文本 */}
          <button
            onClick={() => handleClick(item.id)}
            data-toc-id={item.id}
            className={`flex-1 text-left py-1 px-2 rounded transition-all duration-200 text-sm truncate ${
              hasChildren ? '' : 'ml-4'
            } ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            style={{
              paddingLeft: hasChildren ? '0.5rem' : `${effectiveDepth * 0.5 + 0.5}rem`
            }}
            title={item.text}
          >
            {item.text}
          </button>
        </div>

        {/* 子项 */}
        {hasChildren && !isCollapsed && (
          <ul className="ml-2 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2">
            {item.children.map((child) => renderTOCItem(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  if (toc.length === 0) return null

  return (
    <aside className="hidden lg:block w-80 flex-shrink-0">
      <div className="sticky top-24">
        {/* 优雅的标题 */}
        <div className="mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-900 dark:text-gray-100 opacity-60">
            目录
          </h3>
        </div>

        {/* 目录内容 - 不再固定，随页面滚动 */}
        <div ref={tocListRef} className="pr-2 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {toc.map((item) => renderTOCItem(item))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
