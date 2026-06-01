import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-12 py-16 md:grid-cols-4">
        <div className="space-y-6">
          <Link href="/" className="relative flex items-center h-12 w-32">
            <Image
              src="/images/logo.png"
              alt="Florlen"
              fill
              sizes="(max-width: 768px) 128px, 128px"
              className="object-contain object-left"
            />
          </Link>
          <p className="text-sm text-secondary">
            Handcrafting the future of collectibles, one stitch at a time. Designed by you, handmade
            with love.
          </p>
        </div>
        <div>
          <h4 className="mb-6 font-bold">Shop</h4>
          <ul className="space-y-4 text-sm text-secondary">
            <li>
              <a
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="ai-studio"
              >
                AI Studio
              </a>
            </li>
            <li>
              <a
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="collections"
              >
                All Collections
              </a>
            </li>
            <li>
              <a
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="shop"
              >
                Limited Editions
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 font-bold">Company</h4>
          <ul className="space-y-4 text-sm text-secondary">
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/our-story"
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/sustainability"
              >
                Sustainability
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 font-bold">Support</h4>
          <ul className="space-y-4 text-sm text-secondary">
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/care-guide"
              >
                Care Guide
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/shipping-info"
              >
                Shipping Info
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/privacy-policy"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                className="transition-all duration-300 hover:text-primary hover:underline"
                href="/about/terms-of-service"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-surface-container-high px-12 py-8 text-sm text-secondary md:flex-row">
        <p>Copyright 2024 Florlen. Handmade with love.</p>
        <p>Designed for collectors.</p>
      </div>
    </footer>
  );
}
