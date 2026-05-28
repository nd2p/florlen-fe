'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { listCollections, type Collection } from '@/lib/api/collection.api';
import { type ProductListItem } from '@/lib/api/product.api';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/common/product-card';
import CollectionCard from '@/components/common/collection-card';

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function getProductImage(product: ProductListItem): string {
  const primary = product.product_images?.find((img) => img.is_primary && img.is_active);
  return primary?.url ?? product.product_images?.[0]?.url ?? '/placeholder-product.jpg';
}

/* ------------------------------------------------------------------ */
/* Placeholder card                                                     */
/* ------------------------------------------------------------------ */

function PlaceholderCard() {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square rounded-xl bg-surface-container border border-dashed border-outline/20" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-surface-container-high animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-surface-container-high animate-pulse" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton loading state                                               */
/* ------------------------------------------------------------------ */

function CollectionSkeleton() {
  return (
    <section className="w-full py-20 bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-8 space-y-10">
        {/* Title */}
        <div className="space-y-3 text-center">
          <div className="h-4 w-24 rounded bg-surface-container-high animate-pulse mx-auto" />
          <div className="h-10 w-64 rounded-xl bg-surface-container-highest/60 animate-pulse mx-auto" />
        </div>
        {/* Tabs */}
        <div className="flex gap-8 border-b border-outline-variant/30">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-20 rounded bg-surface-container-high animate-pulse mb-3" />
          ))}
        </div>
        {/* Banner */}
        <div className="flex gap-8 rounded-xl bg-surface-container-low animate-pulse h-[200px]" />
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-surface-container animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

export function CollectionShowcase() {
  const { t } = useTranslation('common');

  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await listCollections({ limit: 8, is_featured: true });
        setCollections(res.collections);
      } catch (err) {
        console.error('Failed to fetch collections', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return <CollectionSkeleton />;
  if (collections.length === 0) return null;

  const active = collections[activeIdx];
  const products: ProductListItem[] = (active.collection_products ?? [])
    .slice(0, 4)
    .map((cp) => cp.products);

  /* ---- render ---- */
  return (
    <section className="w-full py-20 bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-8 space-y-10">

        {/* Section header */}
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            {t('home.collection.label')}
          </p>
          <h2 className="font-headline text-5xl font-black tracking-tight text-on-surface">
            {t('home.collection.title')}
          </h2>
        </div>

        {/* Tab navigation */}
        <nav
          className="flex gap-0 overflow-x-auto scrollbar-none border-b border-outline-variant/30"
          aria-label="Collection tabs"
        >
          {collections.map((col, idx) => (
            <button
              key={col.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative shrink-0 px-5 pb-3 text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
                idx === activeIdx
                  ? 'text-on-surface after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-on-surface after:content-[""]'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {col.name}
            </button>
          ))}
        </nav>

        {/* Hero banner */}
        <CollectionCard collection={active} />

        {/* 4-column product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {products.length > 0
            ? products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  href={`/shop/${p.id}`}
                  imageSizes="(max-width: 640px) 50vw, 25vw"
                />
              ))
            : null}
          {/* Fill remaining slots with placeholders */}
          {Array.from({ length: Math.max(0, 4 - products.length) }).map((_, i) => (
            <PlaceholderCard key={`ph-${i}`} />
          ))}
        </div>

        {/* View more button */}
        <div className="flex justify-center pt-2">
          <Link
            href={`/collections/${active.id}`}
            className="inline-flex items-center gap-2 border-2 border-on-surface px-10 py-3 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-on-surface hover:text-surface transition-all duration-300 rounded-none"
          >
            {t('home.collection.viewMore')}
          </Link>
        </div>
      </div>
    </section>
  );
}
