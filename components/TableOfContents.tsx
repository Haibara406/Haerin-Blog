'use client'

import { useEffect, useState } from 'react'

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

  useEffect(() => {
    // 从内容中提取所有标题 (h1-h6)
    const headings = Array.from(document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6'))

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

    // 监听滚动，高亮当前标题
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [content])

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
            className={`flex-1 text-left py-1 px-2 rounded transition-all duration-200 text-sm ${
              hasChildren ? '' : 'ml-4'
            } ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            style={{
              paddingLeft: hasChildren ? '0.5rem' : `${depth * 0.75 + 0.5}rem`
            }}
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
    <nav className="hidden xl:block sticky top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100 px-2">
        目录
      </div>
      <ul className="space-y-1">
        {toc.map((item) => renderTOCItem(item))}
      </ul>
    </nav>
  )
}