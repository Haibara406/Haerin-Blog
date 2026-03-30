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
      avatar: '/avatar.png',
      desc: '基于 Java 和 Vue 的个人博客系统 / Personal blog system built with Java and Vue',
    },
    {
      name: 'ByteFerry',
      url: 'https://byteferry.haikari.top/#quick',
      avatar: '/avatar.png',
      desc: '基于 Java 和 Redis 的跨平台剪贴板同步工具 / Cross-platform clipboard sync tool',
    },
    {
      name: 'CDU-SNZH MiniApp',
      url: 'https://github.com/Haibara406/cdu-snzh-miniapp',
      avatar: '/avatar.png',
      desc: '蜀南竹海景区数字化服务后端系统 / Digital service backend for Shunan Bamboo Sea scenic area',
    },
    {
      name: 'Damai Pro',
      url: 'https://github.com/Haibara406/damai-pro',
      avatar: '/avatar.png',
      desc: '高并发购票系统解决方案 / High-concurrency ticketing system solutions',
    },
    {
      name: 'Damai AI',
      url: 'https://github.com/Haibara406/damai-ai',
      avatar: '/avatar.png',
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
      <section className="mb-16 max-w-3xl mx-auto animate-slide-up">
        <div className="p-8 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-2xl font-medium mb-4">{t('friends.apply.title')}</h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>{t('friends.apply.welcome')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t('friends.apply.name')}</li>
              <li>{t('friends.apply.url')}</li>
              <li>{t('friends.apply.desc')}</li>
              <li>{t('friends.apply.avatar')}</li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {t('friends.apply.note')}
            </p>
          </div>
        </div>
      </section>

      {/* 友链列表 */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend, index) => (
            <a
              key={friend.name}
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-lg border border-gray-200 dark:border-gray-800
                       hover:border-gray-300 dark:hover:border-gray-700
                       hover:shadow-lg transition-all duration-300 hover:-translate-y-1
                       animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700
                           group-hover:scale-110 transition-transform duration-300"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    {friend.name}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {friend.desc}
              </p>
            </a>
          ))}
        </div>

        {friends.length === 0 && (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            {t('friends.empty')}
          </div>
        )}
      </section>
    </div>
  )
}