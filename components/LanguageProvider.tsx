'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Language = 'en' | 'zh'

const LanguageContext = createContext<{
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
})

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.archive': 'Archive',
    'nav.tags': 'Tags',
    'nav.friends': 'Friends',
    'nav.about': 'About',
    'home.hero.title': 'Thoughts on design,\ncode, and craft',
    'home.hero.subtitle': 'A collection of essays exploring the intersection of technology and creativity.',
    'home.recent': 'Recent Writing',
    'archive.title': 'Archive',
    'archive.subtitle': 'Browse all articles by time',
    'archive.all': 'All Years',
    'tags.title': 'Tag Cloud',
    'tags.all': 'All Tags',
    'tags.articles': 'articles',
    'pagination.prev': 'Previous',
    'pagination.next': 'Next',
    'friends.title': 'Friends',
    'friends.subtitle': 'Awesome friends',
    'friends.apply.title': 'Apply for Friend Link',
    'friends.apply.welcome': 'Welcome to exchange friend links! Please leave a message in the comments or contact me via email:',
    'friends.apply.name': 'Site Name: Haerin Blog',
    'friends.apply.url': 'Site URL: https://haibara406.github.io/Haerin-Blog/',
    'friends.apply.desc': 'Site Description: Recording technology and life',
    'friends.apply.avatar': 'Avatar: /avatar.png',
    'friends.apply.note': 'Please ensure your website content is healthy, positive, and accessible.',
    'friends.empty': 'No friend links yet, welcome to apply!',
    'about.hero.title': 'Hi, I\'m Haibara',
    'about.hero.subtitle': 'Java Developer & Tech Enthusiast',
    'about.hero.contact': 'Get in Touch',
    'about.title': 'About Me',
    'about.intro.p1': 'Hello! I\'m Haibara, currently a junior student majoring in Computer Science at Chengdu University. I mainly study Java development and love creating various interesting projects.',
    'about.intro.p2': 'I enjoy vibe coding, writing small projects, and exploring new technologies. In my spare time, I like watching anime and playing League of Legends, enjoying the balance between code and life.',
    'about.intro.p3': 'This blog is where I record my technical learning and share experiences. I hope to grow together with everyone.',
    'about.stats.articles': 'Articles',
    'about.stats.words': 'Words',
    'about.stats.tags': 'Tags',
    'about.stats.categories': 'Categories',
    'about.skills.title': 'Skills',
    'about.projects.title': 'Projects',
    'about.contact.title': 'Contact',
    'about.contact.email': 'Email',
    'about.contact.location': 'Location',
    'about.contact.location.value': 'Chengdu, Sichuan, China',
    'post.back': 'Back',
    'post.toc': 'Table of Contents',
    'post.comments': 'Comments',
    'post.published': 'Published',
    'post.updated': 'Updated',
    'search.placeholder': 'Search articles...',
    'search.empty': 'No articles found',
    'search.results': 'results',
    'search.close': 'Press ESC to close',
    'footer.rights': 'All rights reserved.',
  },
  zh: {
    'nav.home': '首页',
    'nav.archive': '归档',
    'nav.tags': '标签',
    'nav.friends': '友链',
    'nav.about': '关于',
    'home.hero.title': '关于设计、\n代码与创造的思考',
    'home.hero.subtitle': '探索技术与创意交汇的文章集。',
    'home.recent': '最近文章',
    'archive.title': '归档',
    'archive.subtitle': '按时间浏览所有文章',
    'archive.all': '全部年份',
    'tags.title': '标签云',
    'tags.all': '所有标签',
    'tags.articles': '篇',
    'pagination.prev': '上一页',
    'pagination.next': '下一页',
    'friends.title': '友链',
    'friends.subtitle': '优秀的朋友们',
    'friends.apply.title': '申请友链',
    'friends.apply.welcome': '欢迎交换友链！请在评论区留言或通过邮件联系我：',
    'friends.apply.name': '网站名称：Haerin Blog',
    'friends.apply.url': '网站地址：https://haibara406.github.io/Haerin-Blog/',
    'friends.apply.desc': '网站描述：记录技术与生活',
    'friends.apply.avatar': '头像：/avatar.png',
    'friends.apply.note': '请确保您的网站内容健康、积极向上，并且能够正常访问。',
    'friends.empty': '暂无友链，欢迎申请交换友链！',
    'about.hero.title': '你好，我是 Haibara',
    'about.hero.subtitle': 'Java 开发者 & 技术爱好者',
    'about.hero.contact': '联系我',
    'about.title': '关于我',
    'about.intro.p1': '你好！我是 Haibara，目前是成都大学计算机相关专业的大三学生。主要学习 Java 开发，热衷于开发各种各样有趣的小玩意。',
    'about.intro.p2': '平时喜欢 vibe coding，写写小项目，探索新技术。闲暇时光喜欢看动漫、玩英雄联盟，享受代码与生活的平衡。',
    'about.intro.p3': '这个博客是我记录技术学习和分享经验的地方，希望能与大家一起成长。',
    'about.stats.articles': '文章',
    'about.stats.words': '字',
    'about.stats.tags': '标签',
    'about.stats.categories': '分类',
    'about.skills.title': '技能',
    'about.projects.title': '个人项目',
    'about.contact.title': '联系方式',
    'about.contact.email': '邮箱',
    'about.contact.location': '地点',
    'about.contact.location.value': '中国四川成都',
    'post.back': '返回',
    'post.toc': '目录',
    'post.comments': '评论',
    'post.published': '发布',
    'post.updated': '更新',
    'search.placeholder': '搜索文章...',
    'search.empty': '没有找到相关文章',
    'search.results': '个结果',
    'search.close': '按 ESC 关闭',
    'footer.rights': '版权所有。',
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = (localStorage.getItem('language') as Language) || 'en'
    setLanguageState(savedLang)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)