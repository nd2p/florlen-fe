'use client';

import { useState, useEffect } from 'react';
import { IconZoomIn, IconZoomOut, IconX } from '@tabler/icons-react';

interface ImageLightboxProps {
  /** URL của ảnh cần xem */
  src: string;
  /** Alt text */
  alt: string;
  /** Callback khi đóng */
  onClose: () => void;
}

/**
 * Full-screen image lightbox với zoom in/out bằng scroll chuột hoặc nút bấm.
 * Click backdrop hoặc nút X để đóng.
 */
export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.5, 0.5));
  const resetZoom = () => setScale(1);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(Math.max(s - e.deltaY * 0.001, 0.5), 4));
  };

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      {/* Controls bar */}
      <div
        className="relative z-10 flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale <= 0.5}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30"
          title="Thu nhỏ"
        >
          <IconZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={resetZoom}
          className="px-3 h-8 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-colors min-w-[52px] text-center"
          title="Reset zoom"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          type="button"
          onClick={zoomIn}
          disabled={scale >= 4}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30"
          title="Phóng to"
        >
          <IconZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-white/20 mx-1" />
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          title="Đóng (Esc)"
        >
          <IconX className="w-4 h-4" stroke={2.5} />
        </button>
      </div>

      {/* Image container */}
      <div
        className="relative z-10 overflow-auto max-w-[90vw] max-h-[75vh] rounded-2xl cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease',
            display: 'block',
            maxWidth: '80vw',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: '1rem',
          }}
          draggable={false}
        />
      </div>

      {/* Caption */}
      <p className="relative z-10 mt-4 text-white/60 text-xs font-semibold text-center max-w-[320px] truncate">
        {alt}
      </p>
    </div>
  );
}

/**
 * Hook để quản lý trạng thái lightbox một cách gọn gàng.
 * Trả về { lightboxProps, openLightbox, LightboxNode }
 */
export function useImageLightbox() {
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);

  const openLightbox = (src: string, alt: string) => setPreview({ src, alt });
  const closeLightbox = () => setPreview(null);

  const LightboxNode = preview ? (
    <ImageLightbox src={preview.src} alt={preview.alt} onClose={closeLightbox} />
  ) : null;

  return { openLightbox, closeLightbox, LightboxNode };
}
