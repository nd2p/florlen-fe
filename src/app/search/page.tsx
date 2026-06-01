import { Suspense } from 'react';
import SearchResults from './search-results';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-8 pt-32 pb-24">
          <div className="flex items-center gap-3 text-secondary">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
