'use client'

import { useEffect } from 'react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export default function CodeBlock() {
  useEffect(() => {
    // 为所有代码块添加复制按钮和语言标签
    const codeBlocks = document.querySelectorAll('pre code')

    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement
      if (!pre || pre.querySelector('.code-header')) return

      // 获取语言类型
      const className = codeBlock.className
      const languageMatch = className.match(/language-(\w+)/)
      const language = languageMatch ? languageMatch[1] : 'text'

      // 创建头部容器
      const header = document.createElement('div')
      header.className = 'code-header'

      // 创建语言标签
      const langLabel = document.createElement('span')
      langLabel.className = 'code-language'
      langLabel.textContent = language

      // 创建复制按钮
      const copyButton = document.createElement('button')
      copyButton.className = 'code-copy-button'
      copyButton.innerHTML = `
        <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `

      copyButton.addEventListener('click', async () => {
        const code = codeBlock.textContent || ''
        await navigator.clipboard.writeText(code)

        const copyIcon = copyButton.querySelector('.copy-icon')
        const checkIcon = copyButton.querySelector('.check-icon')

        copyIcon?.classList.add('hidden')
        checkIcon?.classList.remove('hidden')

        setTimeout(() => {
          copyIcon?.classList.remove('hidden')
          checkIcon?.classList.add('hidden')
        }, 2000)
      })

      header.appendChild(langLabel)
      header.appendChild(copyButton)
      pre.insertBefore(header, codeBlock)
    })
  }, [])

  return null
}
