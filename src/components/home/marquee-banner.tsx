'use client';

import { useTranslation } from 'react-i18next';

export function MarqueeBanner() {
  const { t } = useTranslation('common');
  const text = t('home.marquee', { defaultValue: 'Welcome to Florlen ● Chất lượng dệt nên khác biệt' });
  const separator = '  ●  ';
  const items = Array.from({ length: 12 }, () => text + separator).join('');

  return (
    <div className="w-full flex-1 overflow-hidden bg-primary-fixed flex flex-col justify-center">
      <div className="flex whitespace-nowrap py-4 animate-marquee" aria-hidden="false">
        <span
          className="inline-block text-4xl font-black italic uppercase tracking-widest text-on-primary-fixed opacity-40"
          style={{ fontFamily: 'var(--font-plus-jakarta)', WebkitTextStroke: '1px currentColor' }}
        >
          {items}
        </span>
        {/* Duplicate for seamless loop */}
        <span
          className="inline-block text-4xl font-black italic uppercase tracking-widest text-on-primary-fixed opacity-40"
          style={{ fontFamily: 'var(--font-plus-jakarta)', WebkitTextStroke: '1px currentColor' }}
          aria-hidden="true"
        >
          {items}
        </span>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
