![img.png](img.png)# 博客配置指南

## 🎉 功能清单

### ✅ 已实现功能

1. **归档、标签、分类**
   - `/archive` - 按年份归档所有文章
   - `/tags` - 标签云页面
   - `/tags/[tag]` - 按标签筛选文章
   - `/categories/[category]` - 按分类浏览文章

2. **响应式设计**
   - 完全适配手机、平板、桌面端
   - 自适应字体大小和间距
   - 移动端优化的导航栏

3. **代码高亮**
   - 使用 highlight.js 实现代码高亮
   - 支持深色/浅色主题自动切换
   - 优化的代码块样式

4. **图片支持**
   - 自动优化图片显示
   - Hover 放大效果
   - 懒加载支持

5. **本地搜索**
   - 快捷键 `⌘K` / `Ctrl+K` 打开搜索
   - 支持标题、摘要、标签搜索
   - 实时搜索结果

6. **深色模式**
   - 支持浅色/深色/跟随系统三种模式
   - 点击主题按钮循环切换
   - 蓝色圆点表示当前为系统模式

7. **文章目录 (TOC)**
   - 自动提取 H2、H3 标题
   - 滚动时高亮当前章节
   - 点击平滑滚动到对应位置
   - 仅在大屏（XL）显示

8. **返回顶部按钮**
   - 滚动超过 500px 自动显示
   - 平滑滚动动画

9. **Giscus 评论系统**
   - 基于 GitHub Discussions
   - 支持深色模式切换
   - 需要配置（见下方）

10. **性能优化**
    - 所有动画使用 GPU 加速
    - Intersection Observer 实现滚动动画
    - 代码分割和懒加载

## 📝 如何添加博客文章

在 `content/posts/` 目录下创建 `.md` 文件：

\`\`\`markdown
---
title: "文章标题"
date: "2024-03-29"
excerpt: "文章摘要，会显示在列表页"
tags: ["标签1", "标签2", "标签3"]
category: "分类名称"
---

# 文章内容

这里是正文...

## 二级标题

代码示例：

\`\`\`javascript
console.log('Hello World')
\`\`\`

![图片描述](/path/to/image.jpg)
\`\`\`

## 🔧 Giscus 评论系统配置

1. 在 GitHub 上创建一个公开仓库（或使用现有仓库）
2. 启用 Discussions 功能：Settings → Features → Discussions
3. 访问 [giscus.app](https://giscus.app/zh-CN) 获取配置
4. 编辑 `components/Comments.tsx`，替换以下配置：

\`\`\`typescript
script.setAttribute('data-repo', 'your-username/your-repo')
script.setAttribute('data-repo-id', 'your-repo-id')
script.setAttribute('data-category', 'Announcements')
script.setAttribute('data-category-id', 'your-category-id')
\`\`\`

## 🚀 部署到 GitHub Pages

### 方法一：自动部署（推荐）

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择 Source: GitHub Actions
3. 推送代码到 `main` 分支，GitHub Actions 会自动构建和部署

### 方法二：手动部署

\`\`\`bash
npm run build
\`\`\`

将 `out` 目录的内容部署到 GitHub Pages。

## 🎨 自定义配置

### 修改网站标题和描述

编辑 `app/layout.tsx`:

\`\`\`typescript
export const metadata: Metadata = {
  title: '你的博客名称',
  description: '你的博客描述',
}
\`\`\`

### 修改导航栏

编辑 `components/Navigation.tsx`:

\`\`\`typescript
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/archive', label: 'Archive' },
  { href: '/tags', label: 'Tags' },
  { href: '/about', label: 'About' },
]
\`\`\`

### 修改配色

编辑 `app/globals.css` 中的 CSS 变量：

\`\`\`css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --text-primary: #171717;
  --text-secondary: #525252;
  --border-color: #e5e5e5;
  --accent: #171717;
}
\`\`\`

### 修改字体

编辑 `tailwind.config.js`:

\`\`\`javascript
fontFamily: {
  serif: ['Your Serif Font', 'serif'],
  sans: ['Your Sans Font', 'sans-serif'],
}
\`\`\`

## 📱 响应式断点

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔍 SEO 优化建议

1. 为每篇文章添加有意义的 `excerpt`
2. 使用描述性的标题和标签
3. 在 `public` 目录添加 `robots.txt` 和 `sitemap.xml`
4. 添加 Open Graph 和 Twitter Card 元数据

## 🐛 常见问题

### Q: 代码高亮不生效？
A: 确保已安装 `rehype-highlight` 依赖，并在 markdown 代码块中指定语言。

### Q: 搜索功能不工作？
A: 检查 `/api/search/route.ts` 是否正确返回文章数据。

### Q: 评论系统不显示？
A: 确保已正确配置 Giscus，并且仓库是公开的。

### Q: 图片不显示？
A: 将图片放在 `public` 目录下，使用绝对路径引用，如 `/images/photo.jpg`。

## 📚 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **Markdown**: remark + rehype
- **代码高亮**: highlight.js
- **评论**: Giscus
- **部署**: GitHub Pages

## 🎯 下一步优化建议

1. 添加 RSS 订阅功能
2. 集成 Google Analytics 或其他分析工具
3. 添加文章阅读时间估算
4. 实现相关文章推荐
5. 添加文章分享功能
6. 支持多语言

## 📄 License

MIT
