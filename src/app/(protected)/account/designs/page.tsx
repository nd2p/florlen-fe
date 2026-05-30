'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SavedDesignsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile?tab=saved_designs');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-32 text-secondary">
      Redirecting to your Saved Designs...
    </div>
  );
}
