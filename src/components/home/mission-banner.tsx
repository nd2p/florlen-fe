'use client';

import { useTranslation } from 'react-i18next';

export function MissionBanner() {
  const { t } = useTranslation('common');

  return (
    <section className="w-full bg-primary py-28 px-6 text-center">
      <p
        className="mb-3 text-[14px] font-bold uppercase tracking-[0.3em] text-on-primary/70"
        style={{ fontFamily: 'var(--font-plus-jakarta)' }}
      >
        {t('home.mission.label')}
      </p>
      <h2
        className="mx-auto max-w-3xl text-4xl font-bold italic leading-tight tracking-tight text-on-primary md:text-5xl lg:text-6xl"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {t('home.mission.text')}
      </h2>
    </section>
  );
}
