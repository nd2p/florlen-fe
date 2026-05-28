'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listProducts, type ProductListItem } from '@/lib/api/product.api';
import ProductCard from '@/components/common/product-card';

const PAGE_LIMIT = 20;
// 4 columns × 5 rows = 20 products before the scroll-to-top button appears
const SCROLL_TOP_THRESHOLD = 20;

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 aspect-square rounded-2xl bg-surface-container-low" />
      <div className="mb-2 h-4 w-3/4 rounded-lg bg-surface-container-low" />
      <div className="h-4 w-1/2 rounded-lg bg-surface-container-low" />
    </div>
  );
}

export function FullCollection() {
  const { t } = useTranslation('common');
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firstRowRef = useRef<HTMLDivElement>(null);

  // Initial fetch
  useEffect(() => {
    async function fetchInitial() {
      try {
        const res = await listProducts({
          limit: PAGE_LIMIT,
          sort_by: 'updated_at',
        });
        setProducts(res.products);
        setHasMore(res.hasMore);
        setNextCursor(res.nextCursor);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitial();
  }, []);

  // Fetch next page
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await listProducts({
        limit: PAGE_LIMIT,
        sort_by: 'updated_at',
        cursor: nextCursor,
      });
      setProducts((prev) => [...prev, ...res.products]);
      setHasMore(res.hasMore);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error('Failed to load more products', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, nextCursor]);

  // Infinite scroll: observe sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, loadingMore]);

  // Show scroll-to-top button after 5 rows (20 products @ 4 cols)
  useEffect(() => {
    setShowScrollTop(products.length > SCROLL_TOP_THRESHOLD);
  }, [products.length]);

  const scrollToTop = () => {
    firstRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-8">
      {/* Header */}
      <div className="mb-12 flex items-end justify-between" ref={firstRowRef}>
        <div className="space-y-2">
          <h2 className="font-headline text-4xl font-black tracking-tight">
            {t('home.fullCollection.title')}
          </h2>
          <p className="text-secondary">{t('home.fullCollection.subtitle')}</p>
        </div>
        <Link
          href="/shop"
          className="font-bold text-primary underline-offset-4 hover:underline transition-colors"
        >
          {t('home.fullCollection.viewAll')}
        </Link>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="mb-4 text-6xl">🧸</span>
          <p className="text-xl font-bold text-secondary">{t('home.fullCollection.emptyTitle')}</p>
          <p className="mt-2 text-sm text-secondary/70">{t('home.fullCollection.emptySubtitle')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={`/shop/${product.id}`}
                imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ))}

            {/* Skeleton cards while loading more */}
            {loadingMore &&
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4" />


        </>
      )}

      {/* Scroll to top button — appears after 5 rows */}
      {showScrollTop && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 rounded-full border border-outline/30 bg-surface-container-low px-6 py-3 text-sm font-semibold text-on-surface shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-on-primary hover:shadow-xl active:scale-95"
            aria-label="Scroll back to top of collection"
          >
            <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            {t('home.fullCollection.backToTop')}
          </button>
        </div>
      )}
    </section>
  );
}
