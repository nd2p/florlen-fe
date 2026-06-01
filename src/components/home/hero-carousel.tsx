'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { listCollections, type Collection } from '@/lib/api/collection.api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function HeroCarousel() {
  const { t } = useTranslation('common');
  const [api, setApi] = useState<CarouselApi>();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Setup autoplay with 5s delay
  const plugin = React.useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
    []
  );

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await listCollections({ limit: 5 });
        setCollections(res.collections);
      } catch (err) {
        console.error('Failed to fetch collections', err);
      }
    }
    fetchCollections();
  }, []);

  useEffect(() => {
    if (!api) return;

    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) {
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());
      }
    });

    const onSelect = () => {
      if (isMounted) setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      isMounted = false;
      api.off('select', onSelect);
    };
  }, [api, collections]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  return (
    <div className="w-full relative group bg-surface-container-low min-h-187.5 md:min-h-212.5">
      <Carousel setApi={setApi} opts={{ loop: true }} plugins={[plugin]} className="w-full">
        <CarouselContent className="ml-0">
          {/* Default Create Your Own Page (Slide 0) */}
          <CarouselItem className="pl-0 basis-full flex items-center justify-center bg-surface-container-low">
            <div className="flex h-187.5 md:h-212.5 w-full flex-col overflow-hidden md:flex-row">
              <div className="flex-1 flex flex-col justify-center space-y-8 p-12 md:p-8 md:pl-20 h-full bg-surface-container-low">
                <div className="space-y-4">
                  <h1 className="font-headline text-5xl font-black leading-[0.9] tracking-tight text-on-surface md:text-7xl">
                    {t('home.hero.designCrochetStoryPart1')} <br />
                    <span className="text-primary">{t('home.hero.designCrochetStoryPart2')}</span>
                  </h1>
                  <p className="max-w-lg text-xl leading-relaxed text-secondary">
                    {t('home.hero.crochetStoryDesc')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 relative z-20">
                  <Link
                    href="/ai-studio"
                    className="rounded-full bg-primary px-8 py-5 text-lg font-bold text-on-primary transition-all hover:bg-primary-container active:scale-95 text-center"
                  >
                    {t('home.hero.startCustomizing')}
                  </Link>
                  <Link
                    href="/collections"
                    className="rounded-full bg-surface-container-highest px-8 py-5 text-lg font-bold text-on-surface transition-all hover:bg-surface-dim active:scale-95 text-center"
                  >
                    {t('home.hero.viewGallery')}
                  </Link>
                </div>
              </div>
              <div className="relative h-112.5 w-full flex-1 md:h-full bg-surface-container-high">
                <Image
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="h-full w-full object-cover rounded-none"
                  alt={t('home.hero.altRedPanda')}
                  src="/images/ava.jpg"
                />
              </div>
            </div>
          </CarouselItem>

          {/* Top 5 Collections */}
          {collections.map((col) => (
            <CarouselItem key={col.id} className="pl-0 basis-full">
              <div className="relative w-full h-187.5 md:h-212.5 overflow-hidden bg-surface-container-highest">
                <Image
                  fill
                  src={col.banner_image_url || col.cover_image_url || '/placeholder-collection.jpg'}
                  alt={col.name}
                  className="w-full h-full object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end items-center pb-24">
                  <h2 className="text-white text-4xl md:text-5xl font-bold tracking-wide mb-4">
                    {col.name}
                  </h2>
                  <Link
                    href={`/collections/${col.id}`}
                    className="border-b-2 border-white pb-1 text-white font-bold text-sm tracking-widest hover:text-white/80 hover:border-white/80 transition-colors uppercase"
                  >
                    {t('home.hero.buyNow')}
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Custom Navigation Buttons visible on hover */}
        <button
          onClick={scrollPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 opacity-0 group-hover:opacity-100 disabled:opacity-0"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 opacity-0 group-hover:opacity-100 disabled:opacity-0"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Progress Indicator Slider at Bottom */}
        {count > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex w-full max-w-[80%] mx-auto gap-2 md:gap-4 justify-center z-20">
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                className="h-1 flex-1 max-w-30 rounded-full overflow-hidden bg-white/30 cursor-pointer"
                onClick={() => api?.scrollTo(index)}
              >
                <div
                  key={current === index ? 'active' : 'inactive'}
                  className={cn(
                    'h-full bg-white w-full',
                    current === index
                      ? 'animate-[progress_5s_linear_forwards]'
                      : index < current
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                  style={current === index ? { animation: 'progress 5s linear forwards' } : {}}
                />
              </div>
            ))}
          </div>
        )}
      </Carousel>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `,
        }}
      />
    </div>
  );
}
