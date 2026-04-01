'use client'

import MimoInteractiveHero from '@/components/MimoInteractiveHero'
import { useLanguage } from '@/components/LanguageProvider'

export default function MimoPageClient() {
  const { t } = useLanguage()

  return (
    <div className="mimo-page">
      <header className="mimo-page-head mimo-page-head-blog">
        <h1 className="mimo-page-title">{t('mimo.page.title')}</h1>
      </header>

      <MimoInteractiveHero
        title={t('mimo.front.title')}
        altTitle={t('mimo.front.altTitle')}
        label={t('mimo.front.label')}
        pullText={t('mimo.back.pullText')}
        pullHint={t('mimo.back.pullHint')}
        backToggleLabel={t('mimo.back.toggle')}
      />
    </div>
  )
}
