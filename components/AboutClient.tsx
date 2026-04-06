'use client'

import { useLanguage } from '@/components/LanguageProvider'
import { Cake, MapPin, GraduationCap, ExternalLink } from 'lucide-react'
import AppleHelloEffect from '@/components/AppleHelloEffect'

interface Stats {
  totalPosts: number
  totalWords: number
  totalTags: number
  totalCategories: number
}

export default function AboutClient({ stats }: { stats: Stats }) {
  const { t, language } = useLanguage()

  const skillCategories = [
    {
      title: 'Backend',
      skills: ['Java', 'Spring Boot', 'Spring Cloud', 'Spring AI', 'LangChain4j']
    },
    {
      title: 'Database',
      skills: ['MySQL', 'Redis', 'PostgreSQL', 'MongoDB']
    },
    {
      title: 'Message Queue',
      skills: ['Kafka', 'RocketMQ', 'RabbitMQ']
    },
    {
      title: 'Middleware',
      skills: ['Nacos', 'Seata', 'Sentinel', 'ShardingSphere']
    },
    {
      title: 'Search & Analytics',
      skills: ['ElasticSearch', 'Logstash', 'Kibana']
    },
    {
      title: 'Monitoring',
      skills: ['Prometheus', 'Grafana']
    },
    {
      title: 'DevOps',
      skills: ['Docker']
    }
  ]

  const projects = [
    {
      name: 'Personal Blog',
      url: 'https://sherry.haikari.top/',
      desc: {
        zh: '基于 Java 和 Vue 的个人博客系统',
        en: 'Personal blog system built with Java and Vue'
      },
      tech: ['Java', 'MySQL', 'Redis', 'RabbitMQ', 'Vue']
    },
    {
      name: 'ByteFerry',
      url: 'https://byteferry.haikari.top/#quick',
      desc: {
        zh: '基于 Java 和 Redis 的跨平台剪贴板同步工具',
        en: 'Cross-platform clipboard sync tool built with Java and Redis'
      },
      tech: ['Java', 'MySQL', 'Redis']
    },
    {
      name: 'CDU-SNZH MiniApp',
      url: 'https://github.com/Haibara406/cdu-snzh-miniapp',
      desc: {
        zh: '面向蜀南竹海景区的数字化服务后端系统，为微信小程序提供完整的景区管理和游客服务功能',
        en: 'Digital service backend system for Shunan Bamboo Sea scenic area, providing complete scenic area management and tourist service functions for WeChat mini-programs'
      },
      tech: ['Java', 'MySQL', 'Redis', 'MiniApp', 'Docker', 'Dify', 'Qwen', 'RabbitMQ', 'Minio', 'MybatisPlus']
    },
    {
      name: 'Damai Pro',
      url: 'https://github.com/Haibara406/damai-pro',
      desc: {
        zh: '应对高并发产生的各种问题，设计了各种实际落地的解决方案，如：分库分表、锁的优化、缓存三大问题以及高流量下的订单生成、消息丢失如何处理等等问题',
        en: 'Designed practical solutions for high-concurrency challenges including database sharding, lock optimization, cache issues, order generation under high traffic, and message loss handling'
      },
      tech: ['Java', 'MySQL', 'Redis', 'Kafka', 'Docker', 'SpringCloud', 'Nacos', 'MybatisPlus', 'ElasticSearch', 'LogStash', 'Kibana', 'ShardingSphere', 'Prometheus', 'Grafana']
    },
    {
      name: 'Damai AI',
      url: 'https://github.com/Haibara406/damai-ai',
      desc: {
        zh: '为购票系统设计开发的 AI 智能服务平台，包含购票咨询、运维分析、知识问答三大功能模块。购票咨询和知识问答提供给用户，让用户只需对话便可了解规则、查看节目详情、下单等操作。运维分析提供给内部人员，让 AI 赋能故障排查的场景',
        en: 'AI intelligent service platform designed for ticketing systems, featuring three major modules: ticket consultation, operations analysis, and knowledge Q&A. Consultation and Q&A enable users to understand rules, view event details, and place orders through conversation. Operations analysis empowers internal staff with AI-driven troubleshooting'
      },
      tech: ['Java', 'SpringAI', 'Elasticsearch', 'Prometheus', 'MCP Protocol', 'QWen', 'DeepSeek']
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      {/* Apple Hello Effect */}
      <section className="mb-16 animate-fade-in">
        <AppleHelloEffect
          speed={0.8}
          loop={true}
        />
      </section>

      {/* Hero Section with Avatar */}
      <section className="mb-32 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-56 h-56 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800
                          shadow-2xl group-hover:shadow-3xl transition-all duration-700 ease-out
                          group-hover:scale-[1.02]">
              <img
                src="/avatar.png"
                alt="Avatar"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="absolute -inset-4 rounded-full border border-gray-200 dark:border-gray-800
                          opacity-0 group-hover:opacity-30 scale-95 group-hover:scale-100
                          transition-all duration-700"></div>
          </div>

          {/* Intro */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <h1 className="font-serif text-6xl sm:text-7xl font-light tracking-tight
                         bg-gradient-to-br from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400
                         bg-clip-text text-transparent">
              {t('about.hero.title')}
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-600 dark:text-gray-400 font-light leading-relaxed">
              {t('about.hero.subtitle')}
            </p>

            {/* Info with Icons */}
            <div className="flex flex-wrap gap-6 justify-center md:justify-start text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4" />
                <span className="text-sm">2005.03.02</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Chengdu, Sichuan</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">Chengdu University</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              <a
                href="mailto:haibaraiii@foxmail.com"
                className="px-8 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                         rounded-full hover:scale-[1.02] transition-all duration-300 text-sm font-medium
                         shadow-lg hover:shadow-xl"
              >
                {t('about.hero.contact')}
              </a>
              <a
                href="https://github.com/Haibara406"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-full
                         hover:border-gray-900 dark:hover:border-gray-100 transition-all duration-300
                         text-sm font-medium hover:scale-[1.02]"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cultivation Story */}
      <section className="mb-32 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Decorative element */}
            <div className="absolute -left-8 top-0 w-1 h-full bg-gradient-to-b from-gray-300 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-800"></div>

            <div className="space-y-8 pl-8">
              {language === 'zh' ? (
                <p className="font-serif text-2xl sm:text-3xl leading-loose text-gray-700 dark:text-gray-300
                           tracking-wide">
                  千年以前，看见元婴强者自己的小世界，非常羡慕，于是心中立誓，我也要变强，后抛弃世间情爱，终踏上修仙一途，虽一介散修，但亦往，经历千磨万难，炼气百年，四百年筑基，一千年结丹，两千年突破元婴，又一千年后遭遇瓶颈，决心闭门死关，四千年后的今日，终于突破化神，感叹回首沧桑，道不尽仙凡殊途，尽人间。
                </p>
              ) : (
                <p className="font-serif text-2xl sm:text-3xl leading-loose text-gray-700 dark:text-gray-300
                           tracking-wide">
                  A millennium past, I beheld a Nascent Soul cultivator's personal realm and was filled with envy.
                  I vowed to grow stronger, forsaking worldly attachments to embark upon the path of immortal cultivation.
                  Though but a rogue cultivator, I persevered through countless tribulations—a century refining Qi,
                  four centuries establishing Foundation, a millennium forming the Golden Core, two millennia breaking
                  through to Nascent Soul. After another millennium, I encountered a bottleneck and entered death seclusion.
                  Today, four thousand years hence, I have finally achieved Spirit Severing. Looking back upon the vicissitudes,
                  the gulf between immortal and mortal defies words—such is the mortal realm.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Blog Stats */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-8">
            <div className="text-center group">
              <div className="text-6xl font-light mb-2 group-hover:scale-110 transition-transform duration-300">
                {stats.totalPosts}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-widest">
                {t('about.stats.articles')}
              </div>
            </div>
            <div className="text-center group">
              <div className="text-6xl font-light mb-2 group-hover:scale-110 transition-transform duration-300">
                {Math.round(stats.totalWords / 1000)}k
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-widest">
                {t('about.stats.words')}
              </div>
            </div>
            <div className="text-center group">
              <div className="text-6xl font-light mb-2 group-hover:scale-110 transition-transform duration-300">
                {stats.totalTags}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-widest">
                {t('about.stats.tags')}
              </div>
            </div>
            <div className="text-center group">
              <div className="text-6xl font-light mb-2 group-hover:scale-110 transition-transform duration-300">
                {stats.totalCategories}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-widest">
                {t('about.stats.categories')}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Skills */}
      <section className="mb-32 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="font-serif text-5xl font-light mb-16 tracking-tight text-center
                     bg-gradient-to-br from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400
                     bg-clip-text text-transparent">
          Skills
        </h2>
        <div className="max-w-4xl mx-auto space-y-8">
          {skillCategories.map((category, categoryIndex) => (
            <div
              key={category.title}
              className="animate-slide-up border-b border-gray-200 dark:border-gray-800 pb-8"
              style={{ animationDelay: `${500 + categoryIndex * 100}ms` }}
            >
              <h3 className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-4">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {category.skills.map((skill, skillIndex) => (
                  <span
                    key={skill}
                    className="text-2xl font-light text-gray-700 dark:text-gray-300
                             hover:text-gray-900 dark:hover:text-gray-100
                             transition-colors duration-300 cursor-default
                             animate-fade-in"
                    style={{ animationDelay: `${600 + categoryIndex * 100 + skillIndex * 50}ms` }}
                  >
                    {skill}
                    {skillIndex < category.skills.length - 1 && (
                      <span className="text-gray-300 dark:text-gray-700 ml-6">·</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-32 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h2 className="font-serif text-5xl font-light mb-16 tracking-tight text-center
                     bg-gradient-to-br from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400
                     bg-clip-text text-transparent">
          {t('about.projects.title')}
        </h2>
        <div className="max-w-4xl mx-auto space-y-1">
          {projects.map((project, index) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative overflow-hidden
                       animate-slide-up"
              style={{ animationDelay: `${700 + index * 150}ms` }}
            >
              <div className="flex items-center gap-8 py-8 px-6
                            border-b border-gray-200 dark:border-gray-800
                            hover:bg-gray-50 dark:hover:bg-gray-900/30
                            transition-all duration-500">
                {/* Index Number */}
                <div className="text-6xl font-light text-gray-200 dark:text-gray-800
                              group-hover:text-gray-300 dark:group-hover:text-gray-700
                              transition-colors duration-500 select-none">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-4 mb-3">
                    <h3 className="text-3xl font-light group-hover:translate-x-2 transition-transform duration-500">
                      {project.name}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100
                                           group-hover:translate-x-1 group-hover:-translate-y-1
                                           transition-all duration-500" />
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {project.desc[language]}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, techIndex) => (
                      <span
                        key={tech}
                        className="text-xs font-medium text-gray-500 dark:text-gray-500
                                 opacity-0 group-hover:opacity-100 transition-all duration-500"
                        style={{ transitionDelay: `${techIndex * 50}ms` }}
                      >
                        {tech}
                        {techIndex < project.tech.length - 1 && <span className="ml-2">·</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute left-0 top-0 w-1 h-full bg-gray-900 dark:bg-gray-100
                              scale-y-0 group-hover:scale-y-100 transition-transform duration-500
                              origin-top"></div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="animate-slide-up max-w-4xl mx-auto" style={{ animationDelay: '700ms' }}>
        <h2 className="font-serif text-5xl font-light mb-16 tracking-tight text-center
                     bg-gradient-to-br from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400
                     bg-clip-text text-transparent">
          {t('about.contact.title')}
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Email */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium">{t('about.contact.email')}</h3>
            </div>
            <a href="mailto:haibaraiii@foxmail.com"
               className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                        transition-colors duration-300 hover:translate-x-1 transform">
              haibaraiii@foxmail.com
            </a>
            <a href="mailto:haibara406@gmail.com"
               className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                        transition-colors duration-300 hover:translate-x-1 transform">
              haibara406@gmail.com
            </a>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-medium">Social Links</h3>
            </div>
            <a href="https://github.com/Haibara406" target="_blank" rel="noopener noreferrer"
               className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                        transition-colors duration-300 hover:translate-x-1 transform">
              GitHub
            </a>
            <a href="https://gitee.com/haibaraiii" target="_blank" rel="noopener noreferrer"
               className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                        transition-colors duration-300 hover:translate-x-1 transform">
              Gitee
            </a>
            <a href="https://blog.csdn.net/2302_80908396" target="_blank" rel="noopener noreferrer"
               className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                        transition-colors duration-300 hover:translate-x-1 transform">
              CSDN
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
