'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type AboutPageKey =
  | 'ourStory'
  | 'careGuide'
  | 'privacyPolicy'
  | 'shippingInfo'
  | 'sustainability'
  | 'termsOfService';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Paragraph({ children }: { children: ReactNode }) {
  return <p className="mb-3">{children}</p>;
}

function SmallParagraph({ children }: { children: ReactNode }) {
  return <p className="mb-2">{children}</p>;
}

function LabeledParagraph({ label, text }: { label: string; text: string }) {
  return (
    <p className="mb-2">
      <strong>{label}</strong> {text}
    </p>
  );
}

export default function AboutPage({ page }: { page: AboutPageKey }) {
  const { t } = useTranslation('common');

  return (
    <main className="text-on-surface text-sm leading-relaxed">
      {page === 'ourStory' && (
        <>
          <h1 className="mb-12 text-center text-3xl font-extrabold uppercase">
            {t('about.ourStory.title')}
          </h1>

          <p className="mb-8">
            {t('about.shared.effectiveDate')}
            <br />
            {t('about.shared.lastUpdated')}
          </p>

          <Section title={t('about.ourStory.sections.beginning.title')}>
            <Paragraph>{t('about.ourStory.sections.beginning.paragraph1')}</Paragraph>
            <Paragraph>{t('about.ourStory.sections.beginning.paragraph2')}</Paragraph>
          </Section>

          <Section title={t('about.ourStory.sections.craft.title')}>
            <Paragraph>{t('about.ourStory.sections.craft.paragraph1')}</Paragraph>
            <Paragraph>{t('about.ourStory.sections.craft.paragraph2')}</Paragraph>
          </Section>

          <Section title={t('about.ourStory.sections.vision.title')}>
            <Paragraph>{t('about.ourStory.sections.vision.paragraph1')}</Paragraph>
          </Section>
        </>
      )}

      {page === 'careGuide' && (
        <>
          <h1 className="mb-12 text-center text-3xl font-extrabold uppercase">
            {t('about.careGuide.title')}
          </h1>

          <p className="mb-8">
            {t('about.shared.effectiveDate')}
            <br />
            {t('about.shared.lastUpdated')}
          </p>

          <Section title={t('about.careGuide.sections.general.title')}>
            <Paragraph>{t('about.careGuide.sections.general.paragraph1')}</Paragraph>
          </Section>

          <Section title={t('about.careGuide.sections.washing.title')}>
            <SmallParagraph>{t('about.careGuide.sections.washing.item1')}</SmallParagraph>
            <SmallParagraph>{t('about.careGuide.sections.washing.item2')}</SmallParagraph>
            <Paragraph>{t('about.careGuide.sections.washing.item3')}</Paragraph>
          </Section>

          <Section title={t('about.careGuide.sections.drying.title')}>
            <SmallParagraph>{t('about.careGuide.sections.drying.item1')}</SmallParagraph>
            <SmallParagraph>{t('about.careGuide.sections.drying.item2')}</SmallParagraph>
            <Paragraph>{t('about.careGuide.sections.drying.item3')}</Paragraph>
          </Section>

          <Section title={t('about.careGuide.sections.reshaping.title')}>
            <Paragraph>{t('about.careGuide.sections.reshaping.paragraph1')}</Paragraph>
          </Section>
        </>
      )}

      {page === 'privacyPolicy' && (
        <>
          <h1 className="mb-12 text-center text-3xl font-extrabold uppercase">
            {t('about.privacyPolicy.title')}
          </h1>

          <p className="mb-8">
            {t('about.shared.effectiveDate')}
            <br />
            {t('about.shared.lastUpdated')}
          </p>

          <Section title={t('about.privacyPolicy.sections.general.title')}>
            <Paragraph>{t('about.privacyPolicy.sections.general.paragraph1')}</Paragraph>
            <Paragraph>{t('about.privacyPolicy.sections.general.paragraph2')}</Paragraph>
          </Section>

          <Section title={t('about.privacyPolicy.sections.collecting.title')}>
            <Paragraph>{t('about.privacyPolicy.sections.collecting.paragraph1')}</Paragraph>
          </Section>

          <Section title={t('about.privacyPolicy.sections.usage.title')}>
            <Paragraph>{t('about.privacyPolicy.sections.usage.intro')}</Paragraph>
            <SmallParagraph>{t('about.privacyPolicy.sections.usage.item1')}</SmallParagraph>
            <SmallParagraph>{t('about.privacyPolicy.sections.usage.item2')}</SmallParagraph>
            <SmallParagraph>{t('about.privacyPolicy.sections.usage.item3')}</SmallParagraph>
            <Paragraph>{t('about.privacyPolicy.sections.usage.item4')}</Paragraph>
          </Section>

          <Section title={t('about.privacyPolicy.sections.security.title')}>
            <Paragraph>{t('about.privacyPolicy.sections.security.paragraph1')}</Paragraph>
          </Section>
        </>
      )}

      {page === 'shippingInfo' && (
        <>
          <h1 className="mb-12 text-center text-3xl font-extrabold uppercase">
            {t('about.shippingInfo.title')}
          </h1>

          <p className="mb-8">
            {t('about.shared.effectiveDate')}
            <br />
            {t('about.shared.lastUpdated')}
          </p>

          <Section title={t('about.shippingInfo.sections.delivery.title')}>
            <Paragraph>{t('about.shippingInfo.sections.delivery.paragraph1')}</Paragraph>
          </Section>

          <Section title={t('about.shippingInfo.sections.processing.title')}>
            <Paragraph>{t('about.shippingInfo.sections.processing.paragraph1')}</Paragraph>
          </Section>

          <Section title={t('about.shippingInfo.sections.rates.title')}>
            <LabeledParagraph
              label={t('about.shippingInfo.sections.rates.item1.label')}
              text={t('about.shippingInfo.sections.rates.item1.text')}
            />
            <LabeledParagraph
              label={t('about.shippingInfo.sections.rates.item2.label')}
              text={t('about.shippingInfo.sections.rates.item2.text')}
            />
          </Section>

          <Section title={t('about.shippingInfo.sections.tracking.title')}>
            <Paragraph>{t('about.shippingInfo.sections.tracking.paragraph1')}</Paragraph>
          </Section>
        </>
      )}

      {page === 'sustainability' && (
        <>
          <h1 className="mb-12 text-center text-3xl font-extrabold uppercase">
            {t('about.sustainability.title')}
          </h1>

          <p className="mb-8">
            {t('about.shared.effectiveDate')}
            <br />
            {t('about.shared.lastUpdated')}
          </p>

          <Section title={t('about.sustainability.sections.commitment.title')}>
            <Paragraph>{t('about.sustainability.sections.commitment.paragraph1')}</Paragraph>
          </Section>

          <Section title={t('about.sustainability.sections.materials.title')}>
            <Paragraph>{t('about.sustainability.sections.materials.paragraph1')}</Paragraph>
          </Section>

          <Section title={t('about.sustainability.sections.ethical.title')}>
            <Paragraph>{t('about.sustainability.sections.ethical.paragraph1')}</Paragraph>
          </Section>
        </>
      )}

      {page === 'termsOfService' && (
        <>
          <h1 className="mb-12 text-center text-3xl font-extrabold uppercase">
            {t('about.termsOfService.title')}
          </h1>

          <p className="mb-8">
            {t('about.shared.effectiveDate')}
            <br />
            {t('about.shared.lastUpdated')}
          </p>

          <Section title={t('about.termsOfService.sections.general.title')}>
            <Paragraph>{t('about.termsOfService.sections.general.paragraph1')}</Paragraph>
            <Paragraph>{t('about.termsOfService.sections.general.paragraph2')}</Paragraph>
          </Section>

          <Section title={t('about.termsOfService.sections.products.title')}>
            <SmallParagraph>{t('about.termsOfService.sections.products.item1')}</SmallParagraph>
            <Paragraph>{t('about.termsOfService.sections.products.item2')}</Paragraph>
          </Section>

          <Section title={t('about.termsOfService.sections.orders.title')}>
            <Paragraph>{t('about.termsOfService.sections.orders.paragraph1')}</Paragraph>
          </Section>

          <Section title={t('about.termsOfService.sections.returns.title')}>
            <Paragraph>{t('about.termsOfService.sections.returns.paragraph1')}</Paragraph>
          </Section>
        </>
      )}
    </main>
  );
}