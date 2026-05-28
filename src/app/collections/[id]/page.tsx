'use client';

import React, { useState, useEffect, useRef, useCallback, use } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import Link from 'next/link';
import {
  SlidersHorizontal,
  ArrowUpDown,
  ChevronUp,
  X,
  RotateCcw,
  Search,
  Filter,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { getCollectionById, type Collection } from '@/lib/api/collection.api';
import { listProducts, type ProductListItem } from '@/lib/api/product.api';
import ProductCard from '@/components/common/product-card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Loading } from '@/components/ui/loading';

const PAGE_LIMIT = 20;
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

function getBannerImage(collection: Collection): string {
  return collection.banner_image_url ?? collection.cover_image_url ?? '';
}

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation('common');

  const sortLabels: Record<string, string> = {
    updated_at: t('shop.sortNewest'),
    price_asc: t('shop.sortPriceAsc'),
    price_desc: t('shop.sortPriceDesc'),
  };

  // Collection Data State
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loadingCollection, setLoadingCollection] = useState<boolean>(true);

  // Filters State
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Debounced filters to avoid excessive API requests
  const [debouncedMinPrice, setDebouncedMinPrice] = useState<string>('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  // Products & Loading State
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  const catalogStartRef = useRef<HTMLDivElement>(null);
  const firstProductRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load collection details
  useEffect(() => {
    async function fetchCollection() {
      try {
        const res = await getCollectionById(id);
        setCollection(res.collection);
      } catch (err) {
        console.error('Failed to load collection metadata', err);
      } finally {
        setLoadingCollection(false);
      }
    }
    fetchCollection();
  }, [id]);

  // Debounce Price inputs and search queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
    }, 400);
    return () => clearTimeout(handler);
  }, [minPrice]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice);
    }, 400);
    return () => clearTimeout(handler);
  }, [maxPrice]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset offset and reload when filters change
  useEffect(() => {
    let isMounted = true;
    async function reloadProducts() {
      setLoadingProducts(true);
      setCurrentOffset(0);
      try {
        const res = await listProducts({
          collection: id,
          limit: PAGE_LIMIT,
          offset: 0,
          sort_by: sortBy,
          min_price: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
          max_price: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
          q: debouncedSearchQuery || undefined,
        });

        if (isMounted) {
          setProducts(res.products);
          setHasMore(res.hasMore);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }
    reloadProducts();

    return () => {
      isMounted = false;
    };
  }, [id, sortBy, debouncedMinPrice, debouncedMaxPrice, debouncedSearchQuery]);

  // Load more function
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextOffset = currentOffset + PAGE_LIMIT;
    try {
      const res = await listProducts({
        collection: id,
        limit: PAGE_LIMIT,
        offset: nextOffset,
        sort_by: sortBy,
        min_price: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
        max_price: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
        q: debouncedSearchQuery || undefined,
      });

      setProducts((prev) => [...prev, ...res.products]);
      setHasMore(res.hasMore);
      setCurrentOffset(nextOffset);
    } catch (err) {
      console.error('Failed to load more products', err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    id,
    loadingMore,
    hasMore,
    currentOffset,
    sortBy,
    debouncedMinPrice,
    debouncedMaxPrice,
    debouncedSearchQuery,
  ]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loadingProducts) {
          loadMoreProducts();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreProducts, hasMore, loadingMore, loadingProducts]);

  // Scroll to top button visibility
  useEffect(() => {
    setShowScrollTop(products.length > SCROLL_TOP_THRESHOLD);
  }, [products.length]);

  const scrollToTop = () => {
    firstProductRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSortBy('updated_at');
    setSearchQuery('');
  };

  // Fast preset filters
  const applyPresetPrice = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const scrollDownToCatalog = () => {
    catalogStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loadingCollection) {
    return <Loading variant="skeleton-detail" className="pt-32" />;
  }

  if (!collection) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-32 text-center bg-surface">
        <span className="text-7xl mb-4">🧸</span>
        <h1 className="font-headline text-3xl font-black text-on-surface">Collection not found</h1>
        <Link
          href="/collections"
          className="mt-6 flex items-center gap-2 text-primary font-bold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('collections.backToCollections')}
        </Link>
      </div>
    );
  }

  const bannerImg = getBannerImage(collection);

  return (
    <div className="bg-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* FULL-SCREEN COVER HERO BANNER */}
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Cover Image Background */}
        {bannerImg ? (
          <Image
            fill
            priority
            sizes="100vw"
            src={bannerImg}
            alt={collection.name}
            className="object-cover pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-surface-container-highest" />
        )}

        {/* Low-opacity Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

        {/* Floating Back Button */}
        <Link
          href="/collections"
          className="absolute top-24 left-8 z-20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:text-white/85 hover:underline active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('collections.backToCollections')}
        </Link>

        {/* Centered Collection Content */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl flex flex-col items-center select-none space-y-6">
          <h1 
            className="font-headline text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-none drop-shadow-2xl text-transparent"
            style={{ WebkitTextStroke: '2px white' }}
          >
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-2xl leading-relaxed font-medium drop-shadow-md">
              {collection.description}
            </p>
          )}
        </div>

        {/* Animated Scroll Down Prompt */}
        <button
          onClick={scrollDownToCatalog}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors animate-bounce cursor-pointer"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">
            {t('collections.scrollDown')}
          </span>
          <ChevronDown className="h-5 w-5" />
        </button>
      </section>

      {/* PRODUCTS CATALOG SECTION BELOW THE FOLD */}
      <div ref={catalogStartRef} className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
        {/* Statistics and Filter header */}
        <div className="mb-12 border-b border-outline/10 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-primary font-headline">
                {collection.name}
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-black tracking-tight text-on-surface">
                Collection Products
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-secondary">
                {products.length === 1
                  ? t('shop.showing_one', { count: products.length })
                  : t('shop.showing_other', { count: products.length })}
              </span>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 rounded-full border border-primary/20 bg-surface px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary/5 active:scale-95"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('shop.filter')}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-10">
          {/* SIDEBAR FILTER PANEL - Desktop only */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-24 self-start">
            <div className="flex items-center justify-between border-b border-outline/15 pb-4">
              <h2 className="text-lg font-black tracking-tight text-on-surface flex items-center gap-2 font-headline">
                <Filter className="h-5 w-5 text-primary" />
                {t('shop.filterTitle')}
              </h2>
              {(minPrice || maxPrice || searchQuery || sortBy !== 'updated_at') && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t('shop.reset')}
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-secondary font-headline">
                {t('shop.searchLabel')}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('shop.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-high border border-transparent px-4 py-3 pl-10 text-sm text-on-surface outline-none transition-all placeholder:text-secondary focus:border-primary/20 focus:ring-2 focus:ring-primary/10"
                />
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-secondary font-headline">
                {t('shop.sortByLabel')}
              </label>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="w-full flex items-center justify-between rounded-xl bg-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-variant active:scale-95 transition-all text-left h-auto"
                  >
                    <span>{sortLabels[sortBy] || t('shop.sortNewest')}</span>
                    <ArrowUpDown className="h-4 w-4 text-secondary shrink-0 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64 rounded-xl border border-outline/10 bg-surface shadow-2xl p-2 z-[60]"
                >
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    <DropdownMenuRadioItem
                      value="updated_at"
                      className="rounded-lg text-sm text-on-surface focus:bg-primary/5 focus:text-primary py-2 cursor-pointer"
                    >
                      {t('shop.sortNewest')}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="price_asc"
                      className="rounded-lg text-sm text-on-surface focus:bg-primary/5 focus:text-primary py-2 cursor-pointer"
                    >
                      {t('shop.sortPriceAsc')}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="price_desc"
                      className="rounded-lg text-sm text-on-surface focus:bg-primary/5 focus:text-primary py-2 cursor-pointer"
                    >
                      {t('shop.sortPriceDesc')}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-secondary font-headline">
                {t('shop.priceRangeLabel')}
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder={t('shop.priceFrom')}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-high border border-transparent px-3 py-2.5 text-center text-sm font-bold text-on-surface outline-none transition-all focus:border-primary/20 focus:ring-2 focus:ring-primary/10"
                />
                <span className="text-secondary font-bold">–</span>
                <Input
                  type="number"
                  placeholder={t('shop.priceTo')}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-high border border-transparent px-3 py-2.5 text-center text-sm font-bold text-on-surface outline-none transition-all focus:border-primary/20 focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Presets */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPresetPrice('', '200000')}
                  className="bg-surface-container-low border border-outline/5 px-2 py-2 text-xs font-semibold text-on-surface hover:bg-primary/5 hover:text-primary transition-all text-center h-auto"
                >
                  {t('shop.presetUnder200k')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPresetPrice('200000', '500000')}
                  className="bg-surface-container-low border border-outline/5 px-2 py-2 text-xs font-semibold text-on-surface hover:bg-primary/5 hover:text-primary transition-all text-center h-auto"
                >
                  {t('shop.preset200k500k')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPresetPrice('500000', '1000000')}
                  className="bg-surface-container-low border border-outline/5 px-2 py-2 text-xs font-semibold text-on-surface hover:bg-primary/5 hover:text-primary transition-all text-center h-auto"
                >
                  {t('shop.preset500k1M')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPresetPrice('1000000', '')}
                  className="bg-surface-container-low border border-outline/5 px-2 py-2 text-xs font-semibold text-on-surface hover:bg-primary/5 hover:text-primary transition-all text-center h-auto"
                >
                  {t('shop.presetOver1M')}
                </Button>
              </div>
            </div>
          </aside>

          {/* MAIN PRODUCT CATALOG */}
          <main className="flex-1">
            <div ref={firstProductRef} />

            {loadingProducts ? (
              /* Skeletons */
              <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-28 text-center bg-surface-container-low/30 rounded-3xl border border-dashed border-outline/20 p-8">
                <span className="mb-4 text-7xl animate-bounce duration-1000">🌸</span>
                <h3 className="font-headline text-2xl font-black text-on-surface">
                  {t('shop.noProductsTitle')}
                </h3>
                <p className="mt-2 text-secondary text-sm max-w-sm">{t('shop.noProductsDesc')}</p>
                <Button
                  onClick={handleResetFilters}
                  variant="primary"
                  className="mt-6 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('shop.resetFilters')}
                </Button>
              </div>
            ) : (
              /* Product Catalog Grid */
              <>
                <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      href={`/shop/${product.id}`}
                      imageSizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ))}

                  {/* Skeletons while fetching more pages */}
                  {loadingMore &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonCard key={`more-skel-${i}`} />
                    ))}
                </div>

                {/* Scroll Sentinel */}
                <div ref={sentinelRef} className="h-8" />
              </>
            )}
          </main>
        </div>
      </div>

      {/* FLOAT SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          variant="primary"
          className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 hover:bg-primary/95 px-0 py-0"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6 stroke-[3]" />
        </Button>
      )}

      {/* MOBILE FILTER SIDEBAR OVERLAY/DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm lg:hidden transition-all duration-300">
          <div className="w-full max-w-sm bg-surface p-6 shadow-2xl flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-outline/10 pb-4 mb-6">
              <h3 className="text-lg font-black tracking-tight text-on-surface flex items-center gap-2 font-headline">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                {t('shop.filterTitle')}
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full p-2 hover:bg-surface-container-high transition-colors text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-secondary font-headline">
                  {t('shop.searchLabel')}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t('shop.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl bg-surface-container-high border border-transparent px-4 py-3 pl-10 text-sm text-on-surface outline-none transition-all placeholder:text-secondary focus:border-primary/20 focus:ring-2 focus:ring-primary/10"
                  />
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                </div>
              </div>

              {/* Sorting */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-secondary font-headline">
                  {t('shop.sortByLabel')}
                </label>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="w-full flex items-center justify-between rounded-xl bg-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-variant active:scale-95 transition-all text-left h-auto"
                    >
                      <span>{sortLabels[sortBy] || t('shop.sortNewest')}</span>
                      <ArrowUpDown className="h-4 w-4 text-secondary shrink-0 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-64 rounded-xl border border-outline/10 bg-surface shadow-2xl p-2 z-[60]"
                  >
                    <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                      <DropdownMenuRadioItem
                        value="updated_at"
                        className="rounded-lg text-sm text-on-surface focus:bg-primary/5 focus:text-primary py-2 cursor-pointer"
                      >
                        {t('shop.sortNewest')}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="price_asc"
                        className="rounded-lg text-sm text-on-surface focus:bg-primary/5 focus:text-primary py-2 cursor-pointer"
                      >
                        {t('shop.sortPriceAsc')}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="price_desc"
                        className="rounded-lg text-sm text-on-surface focus:bg-primary/5 focus:text-primary py-2 cursor-pointer"
                      >
                        {t('shop.sortPriceDesc')}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-secondary font-headline">
                  {t('shop.priceRangeLabel')}
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder={t('shop.priceFrom')}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-xl bg-surface-container-high border border-transparent px-3 py-2.5 text-center text-sm font-bold text-on-surface outline-none transition-all"
                  />
                  <span className="text-secondary font-bold">–</span>
                  <Input
                    type="number"
                    placeholder={t('shop.priceTo')}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl bg-surface-container-high border border-transparent px-3 py-2.5 text-center text-sm font-bold text-on-surface outline-none transition-all"
                  />
                </div>

                {/* Presets */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => applyPresetPrice('', '200000')}
                    className="bg-surface-container-low border border-outline/5 px-2 py-2 text-xs font-semibold text-on-surface hover:bg-primary/5 hover:text-primary transition-all text-center h-auto"
                  >
                    {t('shop.presetUnder200k')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => applyPresetPrice('200000', '500000')}
                    className="bg-surface-container-low border border-outline/5 px-2 py-2 text-xs font-semibold text-on-surface hover:bg-primary/5 hover:text-primary transition-all text-center h-auto"
                  >
                    {t('shop.preset200k500k')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => applyPresetPrice('500000', '1000000')}
                    className="bg-surface-container-low border border-outline/5 px-2 py-2 text-xs font-semibold text-on-surface hover:bg-primary/5 hover:text-primary transition-all text-center h-auto"
                  >
                    {t('shop.preset500k1M')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => applyPresetPrice('1000000', '')}
                    className="bg-surface-container-low border border-outline/5 px-2 py-2 text-xs font-semibold text-on-surface hover:bg-primary/5 hover:text-primary transition-all text-center h-auto"
                  >
                    {t('shop.presetOver1M')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-outline/10 pt-6 mt-6 flex gap-4">
              <Button
                onClick={() => {
                  handleResetFilters();
                  setShowMobileFilters(false);
                }}
                variant="secondary"
                className="flex-1 rounded-full border border-primary/20 py-3 text-sm font-bold text-primary hover:bg-primary/5 transition-all"
              >
                {t('shop.reset')}
              </Button>
              <Button
                onClick={() => setShowMobileFilters(false)}
                variant="primary"
                className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-on-primary hover:bg-primary/95 transition-all"
              >
                {t('shop.apply')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
