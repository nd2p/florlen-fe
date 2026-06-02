"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="w-full bg-surface-container-low">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-12 py-16 md:grid-cols-4">
        <div className="space-y-6">
          <Link href="/" className="relative flex items-center h-12 w-32">
            <Image
              src="/images/logo.png"
              alt="Florlen"
              fill
              sizes="(max-width: 768px) 128px, 128px"
              className="object-contain object-left"
            />
          </Link>
          <p className="text-sm text-secondary">{t('footer.tagline')}</p>
        </div>
        <div>
          <h4 className="mb-6 font-bold">{t('footer.sections.shop')}</h4>
          <ul className="space-y-4 text-sm text-secondary">
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/ai-studio"
              >
                {t('footer.links.aiStudio')}
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/collections"
              >
                {t('footer.links.collections')}
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/shop"
              >
                {t('footer.links.limitedEditions')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 font-bold">{t('footer.sections.company')}</h4>
          <ul className="space-y-4 text-sm text-secondary">
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/our-story"
              >
                {t('footer.links.ourStory')}
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/sustainability"
              >
                {t('footer.links.sustainability')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 font-bold">{t('footer.sections.support')}</h4>
          <ul className="space-y-4 text-sm text-secondary">
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/care-guide"
              >
                {t('footer.links.careGuide')}
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/shipping-info"
              >
                {t('footer.links.shippingInfo')}
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/privacy-policy"
              >
                {t('footer.links.privacyPolicy')}
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/terms-of-service"
              >
                {t('footer.links.termsOfService')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-surface-container-high px-12 py-8 text-sm text-secondary md:flex-row">
        <p>{t('footer.copyright')}</p>
        <p>{t('footer.designedForCollectors')}</p>
      </div>
    </footer>
  );
}
