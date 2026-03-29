'use client'

import { useLanguage } from '@/components/LanguageProvider'

interface Stats {
  totalPosts: number
  totalWords: number
  totalTags: number
  totalCategories: number
}

export default function AboutClient({ stats }: { stats: Stats }) {
  const { t } = useLanguage()

  const skills = [
    'Java', 'Spring Boot', 'React', 'Next.js', 'TypeScript',
    'Tailwind CSS', 'MySQL', 'Redis', 'Docker'
  ]

  const projects = [
    { name: 'Personal Blog (Old)', url: 'https://sherry.haikari.top/', desc: '旧版个人博客' },
    { name: 'ByteFerry', url: 'https://byteferry.haikari.top/#quick', desc: '字节摆渡项目' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Hero Section with Avatar */}
      <section className="mb-20 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-800
                          shadow-xl group-hover:shadow-2xl transition-all duration-500
                          group-hover:scale-105 group-hover:rotate-3">
              <img
                src="/avatar.png"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-700
                          scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125
                          transition-all duration-500"></div>
          </div>

          {/* Intro */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-serif text-5xl sm:text-6xl font-light mb-4 tracking-tight">
              {t('about.hero.title')}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
              {t('about.hero.subtitle')}
            </p>
            <p className="text-base text-gray-500 dark:text-gray-500 mb-6">
              🎂 2005.03.02 · 📍 Chengdu, Sichuan · 🎓 Chengdu University
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a
                href="mailto:haibaraiii@foxmail.com"
                className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                         rounded-full hover:scale-105 transition-transform duration-200"
              >
                {t('about.hero.contact')}
              </a>
              <a
                href="https://github.com/Haibara406"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-full
                         hover:border-gray-900 dark:hover:border-gray-100 transition-colors duration-200"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Me */}
      <section className="mb-20 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="font-serif text-4xl font-light mb-8 tracking-tight">
          {t('about.title')}
        </h2>
        <div className="space-y-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          <p>{t('about.intro.p1')}</p>
          <p>{t('about.intro.p2')}</p>
          <p>{t('about.intro.p3')}</p>
        </div>

        {/* Blog Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="text-3xl font-light mb-2">{stats.totalPosts}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('about.stats.articles')}</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="text-3xl font-light mb-2">{Math.round(stats.totalWords / 1000)}k</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('about.stats.words')}</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="text-3xl font-light mb-2">{stats.totalTags}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('about.stats.tags')}</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="text-3xl font-light mb-2">{stats.totalCategories}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('about.stats.categories')}</div>
          </div>
        </div>
      </section>
      {/* Skills */}
      <section className="mb-20 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="font-serif text-4xl font-light mb-8 tracking-tight">
          {t('about.skills.title')}
        </h2>
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, index) => (
            <span
              key={skill}
              className="px-5 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200
                       hover:scale-105 animate-scale-in cursor-default"
              style={{ animationDelay: `${500 + index * 50}ms` }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-20 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h2 className="font-serif text-4xl font-light mb-8 tracking-tight">
          {t('about.projects.title')}
        </h2>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-lg border border-gray-200 dark:border-gray-800
                       hover:border-gray-300 dark:hover:border-gray-700
                       hover:shadow-lg transition-all duration-300 hover:-translate-y-1
                       group animate-slide-up"
              style={{ animationDelay: `${700 + index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium mb-2 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{project.desc}</p>
                </div>
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="animate-slide-up" style={{ animationDelay: '700ms' }}>
        <h2 className="font-serif text-4xl font-light mb-8 tracking-tight">
          {t('about.contact.title')}
        </h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 mt-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="font-medium mb-2">{t('about.contact.email')}</div>
              <a href="mailto:haibaraiii@foxmail.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                haibaraiii@foxmail.com
              </a>
              <span className="text-gray-400 mx-2">/</span>
              <a href="mailto:haibara406@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                haibara406@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 mt-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <div className="font-medium mb-2">{t('about.contact.location')}</div>
              <div className="text-gray-600 dark:text-gray-400">{t('about.contact.location.value')}</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 mt-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div>
              <div className="font-medium mb-2">Social Links</div>
              <div className="flex flex-wrap gap-4">
                <a href="https://github.com/Haibara406" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  GitHub
                </a>
                <a href="https://gitee.com/haibaraiii" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  Gitee
                </a>
                <a href="https://blog.csdn.net/2302_80908396" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  CSDN
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
