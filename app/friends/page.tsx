'use client'

import { useLanguage } from '@/components/LanguageProvider'

interface Friend {
  name: string
  url: string
  avatar: string
  desc: string
}

export default function Friends() {
  const { t } = useLanguage()

  const friends: Friend[] = [
    {
      name: 'Personal Blog',
      url: 'https://sherry.haikari.top/',
      avatar: '/img1.jpeg',
      desc: '基于 Java 和 Vue 的个人博客系统 / Personal blog system built with Java and Vue',
    },
    {
      name: 'ByteFerry',
      url: 'https://byteferry.haikari.top/#quick',
      avatar: '/img2.jpeg',
      desc: '基于 Java 和 Redis 的跨平台剪贴板同步工具 / Cross-platform clipboard sync tool',
    },
    {
      name: 'CDU-SNZH MiniApp',
      url: 'https://github.com/Haibara406/cdu-snzh-miniapp',
      avatar: '/img3.jpeg',
      desc: '蜀南竹海景区数字化服务后端系统 / Digital service backend for Shunan Bamboo Sea scenic area',
    },
    {
      name: 'Damai Pro',
      url: 'https://github.com/Haibara406/damai-pro',
      avatar: '/img4.jpeg',
      desc: '高并发购票系统解决方案 / High-concurrency ticketing system solutions',
    },
    {
      name: 'Damai AI',
      url: 'https://github.com/Haibara406/damai-ai',
      avatar: '/img5.jpeg',
      desc: 'AI 智能购票服务平台 / AI intelligent ticketing service platform',
    },
    // 用户可以在这里添加友链
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <header className="mb-16 animate-fade-in text-center">
        <h1 className="font-serif text-5xl sm:text-6xl font-light mb-6 tracking-tight">
          {t('friends.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('friends.subtitle')}
        </p>
      </header>

      {/* 友链申请说明 */}
      <section className="mb-16 max-w-4xl mx-auto animate-slide-up">
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
            <h2 className="text-2xl font-light mb-4">{t('friends.apply.title')}</h2>
            <p className="mb-4">{t('friends.apply.welcome')}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pl-6">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">
                {t('friends.apply.siteName')}
              </div>
              <div className="text-lg">Haerin Blog</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">
                {t('friends.apply.avatar')}
              </div>
              <div className="text-lg">/avatar.png</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">
                {t('friends.apply.siteUrl')}
              </div>
              <div className="text-lg">https://haibara406.github.io/Haerin-Blog/</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">
                {t('friends.apply.siteDesc')}
              </div>
              <div className="text-lg">{t('friends.apply.siteDescValue')}</div>
            </div>
          </div>

          <div className="pl-6 pt-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
            {t('friends.apply.note')}
          </div>
        </div>
      </section>

      {/* 友链列表 */}
      <section className="max-w-5xl mx-auto">
        <div className="space-y-1">
          {friends.map((friend, index) => (
            <a
              key={friend.name}
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-6 py-6 px-6
                            border-b border-gray-200 dark:border-gray-800
                            hover:bg-gray-50 dark:hover:bg-gray-900/30
                            transition-all duration-500">
                {/* Image */}
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg
                              group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-light mb-2 group-hover:translate-x-2 transition-transform duration-500">
                    {friend.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {friend.desc}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  className="w-6 h-6 text-gray-400 opacity-0 group-hover:opacity-100
                           group-hover:translate-x-2 transition-all duration-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>

                {/* Hover indicator */}
                <div className="absolute left-0 top-0 w-1 h-full bg-gray-900 dark:bg-gray-100
                              scale-y-0 group-hover:scale-y-100 transition-transform duration-500
                              origin-top"></div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}