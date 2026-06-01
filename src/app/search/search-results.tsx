'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { listProducts, type ProductListItem } from '@/lib/api/product.api';
import { listCollections, type Collection } from '@/lib/api/collection.api';
import ProductCard from '@/components/common/product-card';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || undefined;

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!query) {
      queueMicrotask(() => {
        if (isMounted) {
          setProducts([]);
          setCollections([]);
          setLoading(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }

    async function fetchData() {
      setLoading(true);
      try {
        const [prodRes, colRes] = await Promise.all([
          listProducts({ q: query, limit: 10 }),
          listCollections({ search: query, limit: 10 }),
        ]);
        if (isMounted) {
          setProducts(prodRes.products);
          setCollections(colRes.collections);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-8 pt-32 pb-24">
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-bold text-on-surface">
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
        <p className="mt-2 text-secondary">
          {loading ? 'Searching...' : `${products.length + collections.length} results found`}
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-16">
          {collections.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-on-surface">Collections</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="group relative h-48 overflow-hidden rounded-xl bg-surface-container-high"
                  >
                    <Image
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      src={col.cover_image_url || '/placeholder-collection.jpg'}
                      alt={col.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <h3 className="text-xl font-bold text-white">{col.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {products.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-on-surface">Products</h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} href={`/shop/${prod.id}`} />
                ))}
              </div>
            </section>
          )}

          {!loading && products.length === 0 && collections.length === 0 && query && (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-xl font-medium text-secondary">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-secondary">Try searching for something else.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}