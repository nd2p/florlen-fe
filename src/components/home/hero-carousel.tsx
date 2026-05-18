"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { listCollections, type Collection } from "@/lib/api/collection.api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function HeroCarousel() {
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
        console.error("Failed to fetch collections", err);
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

    api.on("select", onSelect);

    return () => {
      isMounted = false;
      api.off("select", onSelect);
    };
  }, [api, collections]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  return (
    <div className="w-full relative group bg-surface-container-low min-h-[700px] md:min-h-[800px]">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[plugin]}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {/* Default Create Your Own Page (Slide 0) */}
          <CarouselItem className="pl-0 basis-full flex items-center justify-center bg-surface-container-low">
            <div className="flex h-[700px] md:h-[800px] w-full flex-col overflow-hidden md:flex-row">
              <div className="flex-1 flex flex-col justify-center space-y-8 p-12 md:p-24 h-full bg-surface-container-low">
                <div className="space-y-4">
                  <span className="inline-block rounded-full bg-primary-fixed px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-on-primary-fixed">Handmade Collectibles</span>
                  <h1 className="font-headline text-5xl font-black leading-[0.9] tracking-tight text-on-surface md:text-7xl">
                    Design Your Own <br />
                    <span className="text-primary">Crochet Story</span>
                  </h1>
                  <p className="max-w-lg text-xl leading-relaxed text-secondary">
                    Turn your imagination into high-quality, tactile art. Custom handmade companions designed by you, crafted by us.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 relative z-20">
                  <button className="rounded-full bg-primary px-8 py-5 text-lg font-bold text-on-primary transition-all hover:bg-primary-container active:scale-95">Start Customizing</button>
                  <button className="rounded-full bg-surface-container-highest px-8 py-5 text-lg font-bold text-on-surface transition-all hover:bg-surface-dim active:scale-95">View Gallery</button>
                </div>
              </div>
              <div className="relative h-[450px] w-full flex-1 md:h-full bg-surface-container-high">
                <Image
                  fill
                  priority
                  className="h-full w-full object-cover rounded-none"
                  alt="Featured crochet red panda plush"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhKKiFUzCmkeHp5InAESLgcZoStW8aGqa373rYLrgtENv5mdQUv3GyXacQKdXuT7dVaKoT9nojn1Szut-6q0FkyH5gvO67b2ps5w1rlfo3rrr5yD6EX3HcVS96cmQusXL1Cg4mmp6UQvKQTbEZPVC3p8b9y-kw4vfDYpZp0mDT8m9IXY6aO5_ndIwaIgB49bifjkEK23joL2jfjCOoxpaHtGDB4yJdp6MpgXuID3jra45aJ14IaZcazjPr5CXT7nzpnboOy1OTUmU"
                />
                <div className="absolute bottom-8 right-8 rounded-lg bg-surface-container-lowest/80 p-6 backdrop-blur-md shadow-xl">
                  <p className="text-sm font-bold text-on-surface">Community Favorite</p>
                  <p className="text-xs text-secondary">The Red Panda Plush</p>
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* Top 5 Collections */}
          {collections.map((col) => (
            <CarouselItem key={col.id} className="pl-0 basis-full">
              <div className="relative w-full h-[700px] md:h-[800px] overflow-hidden bg-surface-container-highest">
                <Image
                  fill
                  src={col.banner_image_url || col.cover_image_url || "/placeholder-collection.jpg"}
                  alt={col.name}
                  className="w-full h-full object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end items-center pb-24">
                  <h2 className="text-white text-4xl md:text-5xl font-bold tracking-wide mb-4">
                    {col.name}
                  </h2>
                  <button className="border-b-2 border-white pb-1 text-white font-bold text-sm tracking-widest hover:text-white/80 hover:border-white/80 transition-colors uppercase">
                    Mua ngay
                  </button>
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
                className="h-1 flex-1 max-w-[120px] rounded-full overflow-hidden bg-white/30 cursor-pointer"
                onClick={() => api?.scrollTo(index)}
              >
                <div
                  key={current === index ? 'active' : 'inactive'}
                  className={cn(
                    "h-full bg-white w-full",
                    current === index 
                      ? "animate-[progress_5s_linear_forwards]" 
                      : (index < current ? "opacity-100" : "opacity-0")
                  )}
                  style={current === index ? { animation: 'progress 5s linear forwards' } : {}}
                />
              </div>
            ))}
          </div>
        )}
      </Carousel>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
}
