'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { listProducts, type ProductListItem } from '@/lib/api/product.api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function FeaturedProducts() {
  const { t } = useTranslation('common');

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await listProducts({
          is_featured: 'true',
          limit: 6,
          sort_by: 'updated_at',
        });
        setProducts(res.products);
      } catch (err) {
        console.error('Failed to fetch featured products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (!api) return;

    // Set initial center slide
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const getProductImage = (product: ProductListItem) => {
    const primary = product.product_images?.find((img) => img.is_primary && img.is_active);
    return primary?.url || product.product_images?.[0]?.url || '/placeholder-product.jpg';
  };

  // Pad with null values if there are less than 4 to keep carousel aesthetics.
  const displayItems = Array.from({ length: Math.max(4, products.length) }).map((_, idx) => {
    const dbItem = products[idx];
    if (dbItem) {
      return {
        id: dbItem.id,
        name: dbItem.name,
        description: dbItem.short_description || dbItem.description || '',
        image: getProductImage(dbItem),
        tag:
          dbItem.product_type === 'ai_base' ? 'Customizer' : idx === 0 ? 'Masterpiece' : undefined,
        isReal: true,
      };
    }
    return null;
  });

  // Duplicate items to ensure a seamless infinite loop in Embla Carousel
  const loopCount = displayItems.length <= 4 ? 3 : 2;
  const repeatedItems = Array.from({ length: loopCount })
    .map(() => displayItems)
    .flat();

  if (loading) {
    return (
      <section className="w-full py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 mb-12">
          <div className="h-10 w-64 rounded-xl bg-surface-container-highest/60 animate-pulse mx-auto" />
        </div>
        <div className="flex justify-center items-center gap-6 max-w-5xl mx-auto px-4">
          <div className="w-[15%] h-[300px] rounded-3xl bg-surface-container-low/40 animate-pulse scale-90 opacity-40 shrink-0 hidden md:block" />
          <div className="grow h-[510px] rounded-3xl bg-surface-container-low/60 animate-pulse flex flex-col md:flex-row overflow-hidden">
            <div className="md:w-1/2 p-12 space-y-4 flex flex-col justify-center">
              <div className="h-8 w-3/4 rounded-xl bg-surface-container-high/60 animate-pulse" />
              <div className="h-4 w-5/6 rounded-xl bg-surface-container-high/60 animate-pulse mt-4" />
              <div className="h-4 w-2/3 rounded-xl bg-surface-container-high/60 animate-pulse" />
            </div>
            <div className="md:w-1/2 bg-surface-container-high/60 animate-pulse" />
          </div>
          <div className="w-[15%] h-[360px] rounded-3xl bg-surface-container-low/40 animate-pulse scale-90 opacity-40 shrink-0 hidden md:block" />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 bg-background relative overflow-hidden">
      {/* Centered Serif-Style Header */}
      <div className="text-center mb-16 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          {t('home.featured.subtitle')}
        </p>
        <h2 className="font-headline text-5xl font-black tracking-tight">
          {t('home.featured.title')}
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="w-full relative px-0 flex justify-center">
        <Carousel
          setApi={setApi}
          opts={{ align: 'center', loop: true }}
          className="w-full max-w-[100vw]"
        >
          <CarouselContent className="-ml-4 flex items-center h-[550px] md:h-[510px] py-5">
            {repeatedItems.map((item, idx) => {
              const isActive = idx === current;
              return (
                <CarouselItem
                  key={idx}
                  className="pl-4 basis-[85%] md:basis-[70%] lg:basis-[55%] shrink-0 h-full flex items-center justify-center select-none"
                  onClick={() => api?.scrollTo(idx)}
                >
                  {item ? (
                    /* Real Database Product Slide */
                    <div
                      className={`group flex flex-col md:flex-row rounded-[2rem] overflow-hidden cursor-pointer w-full h-full transition-all duration-500 ease-out origin-center ${
                        isActive
                          ? 'bg-neutral-950 text-white border-[10px] border-black scale-100 opacity-100 hover:scale-[1.015]'
                          : 'bg-surface-container-low text-on-surface border-[10px] border-black scale-[0.88] opacity-45 hover:opacity-90 hover:scale-[0.91] blur-[0.5px] hover:blur-none'
                      }`}
                    >
                      {/* Left Side: Info */}
                      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                          {item.tag && isActive && (
                            <span className="inline-block rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white mb-2 shadow-sm animate-pulse">
                              {item.tag}
                            </span>
                          )}
                          <h3
                            className={`font-headline font-black leading-tight tracking-wide ${
                              isActive ? 'text-3xl text-white' : 'text-xl text-on-surface'
                            }`}
                          >
                            {item.name}
                          </h3>
                        </div>
                        <p
                          className={`text-xs md:text-sm leading-relaxed line-clamp-4 ${
                            isActive ? 'text-neutral-300' : 'text-secondary'
                          }`}
                        >
                          {item.description}
                        </p>
                        {isActive && (
                          <div className="pt-4">
                            <Link
                              href={`/shop/${item.id}`}
                              className="inline-flex items-center gap-2 border-b-2 border-white pb-1 text-xs font-bold tracking-widest text-white uppercase hover:text-primary hover:border-primary transition-all duration-300"
                            >
                              {t('home.featured.discoverMore')} &rarr;
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Right Side: Image */}
                      <div className="md:w-1/2 relative h-full min-h-[220px] md:min-h-0 overflow-hidden">
                        <Image
                          fill
                          sizes="(max-width: 768px) 100vw, 30vw"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          alt={item.name}
                          src={item.image}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Placeholder Slide */
                    <div
                      className={`group flex flex-col md:flex-row rounded-[2rem] overflow-hidden w-full h-full cursor-pointer transition-all duration-500 ease-out origin-center ${
                        isActive
                          ? 'bg-neutral-950/80 text-white border-[10px] border-dashed border-black scale-100 opacity-100 hover:scale-[1.015]'
                          : 'bg-surface-container-low/40 text-on-surface/60 border-[10px] border-dashed border-black scale-[0.88] opacity-45 hover:opacity-90 hover:scale-[0.91] hover:blur-none'
                      }`}
                    >
                      {/* Left Side: Info */}
                      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <span className="font-headline font-black text-xl">?</span>
                        </div>
                        <h3 className="font-headline font-black text-xl tracking-wide uppercase">
                          {t('home.featured.placeholderTitle')}
                        </h3>
                        <p className="text-xs md:text-sm leading-relaxed text-secondary/80">
                          {t('home.featured.placeholderDesc')}
                        </p>
                      </div>

                      {/* Right Side: Gradient Mesh */}
                      <div
                        className={`md:w-1/2 h-full min-h-[220px] md:min-h-0 bg-gradient-to-tr ${
                          isActive
                            ? 'from-neutral-900 via-neutral-950 to-neutral-800'
                            : 'from-surface-container-high/20 via-surface-container-low/20 to-surface-container-highest/20'
                        }`}
                      />
                    </div>
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Circular Overlapping Navigation Arrows — pinned to screen edges */}
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/20 hover:bg-black/45 backdrop-blur-sm text-white transition-all active:scale-95 border-2 border-white/10 hover:border-white/25"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 text-white" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/20 hover:bg-black/45 backdrop-blur-sm text-white transition-all active:scale-95 border-2 border-white/10 hover:border-white/25"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 text-white" strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}
