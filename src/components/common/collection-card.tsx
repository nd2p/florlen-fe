'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import type { Collection } from '@/lib/api/collection.api';

interface CollectionCardProps {
  collection: Collection;
  className?: string;
}

function getBannerImage(collection: Collection): string {
  return collection.banner_image_url ?? collection.cover_image_url ?? '';
}

export default function CollectionCard({ collection, className = '' }: CollectionCardProps) {
  const { t } = useTranslation('common');
  const bannerImg = getBannerImage(collection);

  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-12 rounded-2xl bg-surface-container-low border border-outline-variant/20 overflow-hidden ${className}`}>
      {/* Left Pane: Text Content */}
      <div className="flex-1 p-8 md:p-10 flex flex-col justify-center space-y-4">
        <h3 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-on-surface uppercase leading-none">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-sm text-secondary leading-relaxed max-w-md line-clamp-5">
            {collection.description}
          </p>
        )}
        <Link
          href={`/collections/${collection.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-hover transition-colors duration-200 pt-2 w-fit border-b-2 border-primary pb-0.5"
        >
          {t('collections.exploreAll', { defaultValue: 'Explore All' })}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Right Pane: Collection Banner Image */}
      {bannerImg ? (
        <div className="md:w-[40%] relative min-h-[200px] md:min-h-[260px] overflow-hidden">
          <Image
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
            alt={collection.name}
            src={bannerImg}
          />
        </div>
      ) : (
        <div className="md:w-[40%] min-h-[180px] bg-gradient-to-br from-surface-container via-surface-container-high to-surface-container-highest" />
      )}
    </div>
  );
}
