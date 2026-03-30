'use client'

import { useEffect } from 'react'
import mermaid from 'mermaid'

export default function MermaidRenderer() {
  useEffect(() => {
    // 初始化 Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    })

    // 查找所有 mermaid 代码块
    const mermaidBlocks = document.querySelectorAll('pre code.language-mermaid')

    mermaidBlocks.forEach((block, index) => {
      const pre = block.parentElement
      if (!pre || pre.classList.contains('mermaid-rendered')) return

      const code = block.textContent || ''

      // 创建 mermaid 容器
      const mermaidDiv = document.createElement('div')
      mermaidDiv.className = 'mermaid-container'
      mermaidDiv.setAttribute('data-processed', 'true')

      const mermaidContent = document.createElement('div')
      mermaidContent.className = 'mermaid'
      mermaidContent.textContent = code

      mermaidDiv.appendChild(mermaidContent)

      // 替换原来的 pre 标签
      pre.replaceWith(mermaidDiv)
      pre.classList.add('mermaid-rendered')

      // 渲染 mermaid
      mermaid.run({
        querySelector: '.mermaid',
      })
    })
  }, [])

  return null
}
