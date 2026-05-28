import { HeroCarousel } from '@/components/home/hero-carousel';
import { MarqueeBanner } from '@/components/home/marquee-banner';
import { FeaturedProducts } from '@/components/home/featured-products';
import { MissionBanner } from '@/components/home/mission-banner';
import { CollectionShowcase } from '@/components/home/collection-showcase';
import { FullCollection } from '@/components/home/full-collection';

export default function Home() {
  return (
    <div className="bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Hero + Marquee — flush, fills full screen height */}
      <section className="w-full h-screen flex flex-col pt-16">
        <HeroCarousel />
        <MarqueeBanner />
      </section>

      <div className="space-y-24 py-24">
        <FeaturedProducts />

        <MissionBanner />

        <CollectionShowcase />

        <FullCollection />
      </div>
    </div>
  );
}
