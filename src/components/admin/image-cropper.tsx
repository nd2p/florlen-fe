"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type ImageCropperProps = {
    imageUrl: string | null;
    onCancel: () => void;
    onCrop: (croppedFile: File) => void;
    aspectRatio?: number;
};

export default function ImageCropper({ imageUrl, onCancel, onCrop, aspectRatio = 1 }: ImageCropperProps) {
    const { t } = useTranslation("common");

    const [zoom, setZoom] = useState(1);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Image natural and display sizes
    const [naturalWidth, setNaturalWidth] = useState(0);
    const [naturalHeight, setNaturalHeight] = useState(0);
    const [baseWidth, setBaseWidth] = useState(0);
    const [baseHeight, setBaseHeight] = useState(0);

    const imageRef = useRef<HTMLImageElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

    const VIEWPORT_WIDTH = aspectRatio > 1 ? 256 : 256 * aspectRatio;
    const VIEWPORT_HEIGHT = aspectRatio > 1 ? 256 / aspectRatio : 256;

    // Reset when a new image is loaded or opened
    const [timestamp, setTimestamp] = useState(0);
    useEffect(() => {
        void Promise.resolve().then(() => {
            setZoom(1);
            setOffsetX(0);
            setOffsetY(0);
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTimestamp(Date.now());
    }, [imageUrl]);

    const cropperSrc = useMemo(() => {
        if (!imageUrl) return "";
        if (imageUrl.startsWith("http")) {
            return `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}t=${timestamp}`;
        }
        return imageUrl;
    }, [imageUrl, timestamp]);

    if (!imageUrl) return null;

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setNaturalWidth(img.naturalWidth);
        setNaturalHeight(img.naturalHeight);

        // Aspect ratio calculations
        const imgAspect = img.naturalWidth / img.naturalHeight;
        if (imgAspect >= aspectRatio) {
            // Image is wider than the crop viewport aspect ratio: height fits viewport, width scales out
            setBaseWidth(VIEWPORT_HEIGHT * imgAspect);
            setBaseHeight(VIEWPORT_HEIGHT);
        } else {
            // Image is taller than the crop viewport aspect ratio: width fits viewport, height scales out
            setBaseWidth(VIEWPORT_WIDTH);
            setBaseHeight(VIEWPORT_WIDTH / imgAspect);
        }
    };

    // Pointer events for panning (drag & touch support)
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            offsetX: offsetX,
            offsetY: offsetY,
        };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        // Apply boundaries so user can't pan completely outside of visibility
        const limitX = (baseWidth * zoom) / 2;
        const limitY = (baseHeight * zoom) / 2;

        const newOffsetX = Math.max(-limitX, Math.min(limitX, dragStartRef.current.offsetX + deltaX));
        const newOffsetY = Math.max(-limitY, Math.min(limitY, dragStartRef.current.offsetY + deltaY));

        setOffsetX(newOffsetX);
        setOffsetY(newOffsetY);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoom(Number(e.target.value));
    };

    const handleCropConfirm = () => {
        if (!imageRef.current || !naturalWidth || !naturalHeight) return;

        const canvas = document.createElement("canvas");
        const cropResWidth = 800;
        const cropResHeight = Math.round(800 / aspectRatio);
        canvas.width = cropResWidth;
        canvas.height = cropResHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Fill with white background (ideal for product images)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, cropResWidth, cropResHeight);

        const w = baseWidth * zoom;
        const h = baseHeight * zoom;

        // Top-left of the image relative to viewport top-left
        const left = VIEWPORT_WIDTH / 2 + offsetX - w / 2;
        const top = VIEWPORT_HEIGHT / 2 + offsetY - h / 2;

        // Scale factors to map container coordinates back to natural image pixels
        const scaleX = naturalWidth / w;
        const scaleY = naturalHeight / h;

        // Source crop bounding box in natural image coordinates
        const sX = -left * scaleX;
        const sY = -top * scaleY;
        const sW = VIEWPORT_WIDTH * scaleX;
        const sH = VIEWPORT_HEIGHT * scaleY;

        ctx.drawImage(imageRef.current, sX, sY, sW, sH, 0, 0, cropResWidth, cropResHeight);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], "cropped_product_image.png", { type: "image/png" });
            onCrop(file);
        }, "image/png");
    };

    return (
        <div className="flex flex-col items-center justify-between h-full w-full py-2">
            <div className="w-full space-y-4">
                <div className="text-center">
                    <h3 className="font-headline text-lg font-black text-on-surface">
                        {t("adminProducts.dialog.cropTitle")}
                    </h3>
                    <p className="text-xs text-secondary max-w-xs mx-auto mt-1">
                        {t("adminProducts.dialog.cropDesc")}
                    </p>
                </div>

                {/* Viewport Box */}
                <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={{
                        width: `${VIEWPORT_WIDTH}px`,
                        height: `${VIEWPORT_HEIGHT}px`,
                    }}
                    className="relative mx-auto bg-neutral-900 border border-outline overflow-hidden cursor-move touch-none select-none shadow-inner rounded-none"
                >
                    {/* Semi-transparent dark circular/square mask overlays to guide the user */}
                    <div className="absolute inset-0 bg-black/40 pointer-events-none z-10" />
                    <div className="absolute inset-0 border border-white/80 pointer-events-none z-20 rounded-none" />

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        ref={imageRef}
                        src={cropperSrc}
                        crossOrigin="anonymous"
                        alt="To Crop"
                        onLoad={handleImageLoad}
                        style={{
                            transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${zoom})`,
                            left: "50%",
                            top: "50%",
                            maxWidth: "none",
                            width: baseWidth ? `${baseWidth}px` : "auto",
                            height: baseHeight ? `${baseHeight}px` : "auto",
                            userSelect: "none",
                        }}
                        className="absolute object-contain origin-center pointer-events-none select-none"
                    />
                </div>

                {/* Slider Zoom Controls */}
                <div className="w-full max-w-xs mx-auto flex items-center gap-3 px-4">
                    <IconZoomOut className="h-5 w-5 text-secondary shrink-0" stroke={2} />
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        onChange={handleZoomChange}
                        className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <IconZoomIn className="h-5 w-5 text-secondary shrink-0" stroke={2} />
                </div>
            </div>

            {/* Bottom Buttons */}
            <div className="w-full flex justify-end gap-3 pt-6 mt-6 border-t border-outline-variant">
                <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={onCancel}
                    className="rounded-full px-6 py-2.5 text-sm"
                >
                    {t("adminDiscounts.form.cancel")}
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleCropConfirm}
                    className="rounded-full px-6 py-2.5 text-sm"
                >
                    {t("adminProducts.dialog.cropSave")}
                </Button>
            </div>
        </div>
    );
}
