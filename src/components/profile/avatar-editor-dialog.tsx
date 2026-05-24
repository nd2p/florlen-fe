'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  IconCamera,
  IconRotateClockwise,
  IconTrash,
  IconZoomIn,
  IconZoomOut,
  IconLoader2,
  IconX,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { uploadAvatarImage } from '@/lib/api/upload.api';
import { User } from '@/lib/auth';

interface AvatarEditorDialogProps {
  user: User | null;
  previewAvatarUrl: string;
  isAvatarOptionsOpen: boolean;
  setIsAvatarOptionsOpen: (open: boolean) => void;
  isEditorOpen: boolean;
  setIsEditorOpen: (open: boolean) => void;
  onRemoveAvatar: () => Promise<void>;
  onSaveAvatar: (url: string) => Promise<void>;
  getInitials: (name?: string) => string;
}

export default function AvatarEditorDialog({
  user,
  previewAvatarUrl,
  isAvatarOptionsOpen,
  setIsAvatarOptionsOpen,
  isEditorOpen,
  setIsEditorOpen,
  onRemoveAvatar,
  onSaveAvatar,
  getInitials,
}: AvatarEditorDialogProps) {
  const { t } = useTranslation('common');

  // Canvas cropper state
  const [rawImageSrc, setRawImageSrc] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Asynchronously load image when raw source changes
  useEffect(() => {
    if (!rawImageSrc) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadedImage(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      setLoadedImage(img);
      setZoom(1);
      setRotation(0);
      setDragOffset({ x: 0, y: 0 });
    };
    img.src = rawImageSrc;
  }, [rawImageSrc]);

  // Re-draw Canvas when parameters change
  useEffect(() => {
    if (!isEditorOpen || !loadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(cw / 2, ch / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const ratio = loadedImage.width / loadedImage.height;
    let dw = cw;
    let dh = ch;
    if (ratio > 1) {
      dw = ch * ratio;
    } else {
      dh = cw / ratio;
    }

    ctx.drawImage(
      loadedImage,
      -dw / 2 + dragOffset.x / zoom,
      -dh / 2 + dragOffset.y / zoom,
      dw,
      dh
    );
    ctx.restore();
  }, [isEditorOpen, loadedImage, zoom, rotation, dragOffset]);

  // Image file picked
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPEG, JPG, and PNG images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setLoadedImage(null); // force reload
      setIsAvatarOptionsOpen(false);
      setIsEditorOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Accept crop and upload
  const handleAcceptCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        try {
          setIsUploading(true);
          toast.loading(t('profile.settings.avatar.saving') || 'Uploading avatar...', {
            id: 'avatar-upload',
          });

          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          const uploadRes = await uploadAvatarImage(file);

          await onSaveAvatar(uploadRes.url);

          toast.success(t('profile.settings.success') || 'Avatar updated successfully!', {
            id: 'avatar-upload',
          });
          setIsEditorOpen(false);
        } catch (err) {
          console.error(err);
          toast.error('Upload failed', { id: 'avatar-upload' });
        } finally {
          setIsUploading(false);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  // Drag handlers for mouse & touch
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragStart.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    setDragOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      dragStart.current = {
        x: e.touches[0].clientX - dragOffset.x,
        y: e.touches[0].clientY - dragOffset.y,
      };
      isDragging.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    setDragOffset({
      x: e.touches[0].clientX - dragStart.current.x,
      y: e.touches[0].clientY - dragStart.current.y,
    });
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Dialog 1: Avatar Options */}
      <Dialog open={isAvatarOptionsOpen} onOpenChange={setIsAvatarOptionsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('profile.settings.avatar.editTitle') || 'Edit Avatar'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-6 text-center py-6">
            <div className="relative w-28 h-28 mx-auto rounded-full bg-primary/10 border-4 border-surface-container-high overflow-hidden shadow-md">
              {previewAvatarUrl ? (
                <Image
                  src={previewAvatarUrl}
                  fill
                  sizes="112px"
                  className="object-cover"
                  alt={user?.full_name || 'Avatar'}
                />
              ) : (
                <span className="flex items-center justify-center h-full w-full text-primary font-headline font-black text-4xl">
                  {getInitials(user?.full_name)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
              <Button
                variant="primary"
                onClick={triggerFileSelect}
                className="w-full rounded-2xl gap-2 font-bold justify-center"
              >
                <IconCamera className="w-4 h-4" />
                {t('profile.settings.avatar.uploadNew') || 'Upload New Photo'}
              </Button>

              {previewAvatarUrl && (
                <Button
                  variant="secondary"
                  onClick={onRemoveAvatar}
                  className="w-full rounded-2xl gap-2 text-error hover:bg-error/5 border-error/20 hover:border-error/30 font-bold justify-center"
                >
                  <IconTrash className="w-4 h-4" />
                  {t('profile.settings.avatar.remove') || 'Remove Avatar'}
                </Button>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsAvatarOptionsOpen(false)}
              className="w-full rounded-2xl"
            >
              {t('profile.settings.avatar.cancel') || 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Image Cropper / Canvas Editor */}
      <Dialog
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open && !isUploading) {
            setIsEditorOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('profile.settings.avatar.editTitle') || 'Edit Avatar'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-6 py-6 text-center">
            {/* Interactive Canvas */}
            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-primary/20 shadow-md cursor-move bg-surface-container-high/40 select-none">
              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full h-full object-cover"
              />
              {/* Inner crop target border overlay */}
              <div className="absolute inset-0 pointer-events-none rounded-full border border-dashed border-primary/40" />
            </div>

            {/* Micro instructions */}
            <p className="text-[11px] font-semibold text-secondary tracking-wide uppercase">
              {t('profile.settings.avatar.dragInstruction') || 'Drag to Position • Scroll/Slide to Zoom'}
            </p>

            {/* Slider and zoom indicators */}
            <div className="flex items-center gap-4 bg-surface-container-low px-4 py-3 rounded-2xl border border-outline/5 max-w-sm mx-auto">
              <IconZoomOut className="w-5 h-5 text-secondary" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="grow accent-primary cursor-pointer"
              />
              <IconZoomIn className="w-5 h-5 text-secondary" />
            </div>

            {/* Fast rotate actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90) % 360)}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low border border-outline/5 text-xs text-on-surface font-extrabold hover:bg-surface-container-high active:scale-95 rounded-xl transition-all"
              >
                <IconRotateClockwise className="w-4 h-4 -scale-x-100" />
                {t('profile.settings.avatar.rotateLeft') || 'Rotate Left'}
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low border border-outline/5 text-xs text-on-surface font-extrabold hover:bg-surface-container-high active:scale-95 rounded-xl transition-all"
              >
                <IconRotateClockwise className="w-4 h-4" />
                {t('profile.settings.avatar.rotateRight') || 'Rotate Right'}
              </button>
            </div>
          </DialogBody>
          <DialogFooter className="flex flex-row gap-2 border-t border-outline/5 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsEditorOpen(false)}
              disabled={isUploading}
              className="grow rounded-2xl justify-center font-bold"
            >
              <IconX className="w-4 h-4 mr-1" />
              {t('profile.settings.avatar.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={handleAcceptCrop}
              disabled={isUploading || !loadedImage}
              className="grow rounded-2xl justify-center font-bold"
            >
              {isUploading ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin mr-1" />
                  {t('profile.settings.avatar.saving') || 'Applying...'}
                </>
              ) : (
                t('profile.settings.avatar.apply') || 'Apply'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
