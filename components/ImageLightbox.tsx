'use client'

import { useEffect } from 'react'

export default function ImageLightbox() {
  useEffect(() => {
    // 为所有文章图片添加点击放大功能
    const images = document.querySelectorAll('.prose img')

    images.forEach((img) => {
      const imgElement = img as HTMLImageElement
      imgElement.style.cursor = 'zoom-in'

      imgElement.addEventListener('click', () => {
        // 创建遮罩层
        const overlay = document.createElement('div')
        overlay.className = 'image-lightbox-overlay'

        // 创建关闭按钮
        const closeButton = document.createElement('button')
        closeButton.className = 'image-lightbox-close'
        closeButton.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `

        // 创建图片容器
        const imgContainer = document.createElement('div')
        imgContainer.className = 'image-lightbox-container'

        // 克隆图片
        const clonedImg = imgElement.cloneNode(true) as HTMLImageElement
        clonedImg.className = 'image-lightbox-img'
        clonedImg.style.cursor = 'default'

        imgContainer.appendChild(clonedImg)
        overlay.appendChild(closeButton)
        overlay.appendChild(imgContainer)
        document.body.appendChild(overlay)

        // 禁止页面滚动
        document.body.style.overflow = 'hidden'

        // 关闭功能
        const closeLightbox = () => {
          overlay.classList.add('closing')
          setTimeout(() => {
            document.body.removeChild(overlay)
            document.body.style.overflow = ''
          }, 300)
        }

        closeButton.addEventListener('click', closeLightbox)
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay || e.target === imgContainer) {
            closeLightbox()
          }
        })

        // ESC 键关闭
        const handleEsc = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            closeLightbox()
            document.removeEventListener('keydown', handleEsc)
          }
        }
        document.addEventListener('keydown', handleEsc)
      })
    })
  }, [])

  return null
}
