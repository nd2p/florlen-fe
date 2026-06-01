'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listCollections, type Collection } from '@/lib/api/collection.api';
import CollectionCard from '@/components/common/collection-card';

function SkeletonCard() {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-12 rounded-2xl bg-surface-container-low border border-outline-variant/20 overflow-hidden animate-pulse h-[360px] md:h-[260px]">
      <div className="flex-1 p-8 md:p-10 flex flex-col justify-center space-y-4">
        <div className="h-8 w-2/3 bg-surface-container-high rounded" />
        <div className="h-4 w-5/6 bg-surface-container-high rounded" />
        <div className="h-4 w-4/6 bg-surface-container-high rounded" />
        <div className="h-6 w-24 bg-surface-container-high rounded pt-2" />
      </div>
      <div className="md:w-[40%] bg-surface-container-high" />
    </div>
  );
}

export default function CollectionsPage() {
  const { t } = useTranslation('common');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetch() {
      try {
        const res = await listCollections({ limit: 20 });
        if (isMounted) {
          setCollections(res.collections);
        }
      } catch (err) {
        console.error('Failed to fetch collections', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetch();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface px-4 py-24 sm:px-8 max-w-7xl mx-auto">
      {/* Premium Collections Hero Banner */}
      <div className="mb-16 border-b border-outline/10 pb-8 pt-6">
        <div className="space-y-3">
          <h1 className="font-headline text-4xl sm:text-5xl font-black tracking-tight text-on-surface">
            {t('collections.title', { defaultValue: 'Our Crafted Collections' })}
          </h1>
          <p className="max-w-3xl text-secondary text-sm sm:text-base leading-relaxed">
            {t('collections.description', {
              defaultValue:
                'Explore curated collections of premium handcrafted slow-fashion wonders, meticulously stitched to order.',
            })}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Skeletons */
        <div className="flex flex-col gap-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : collections.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-28 text-center bg-surface-container-low/30 rounded-3xl border border-dashed border-outline/20 p-8">
          <span className="mb-4 text-7xl animate-bounce duration-1000">🧸</span>
          <h3 className="font-headline text-2xl font-black text-on-surface">
            {t('collections.empty', { defaultValue: 'No collections found' })}
          </h3>
          <p className="mt-2 text-secondary text-sm max-w-sm">
            Check back soon for new handcrafted releases!
          </p>
        </div>
      ) : (
        /* Collections Stack */
        <div className="flex flex-col gap-10">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  );
}
