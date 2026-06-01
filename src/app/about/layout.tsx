import { ReactNode } from 'react';

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl min-h-screen px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
