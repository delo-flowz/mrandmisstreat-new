'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../styles/gallery.module.css';
import { supabase } from '../../../utils/supabase';
import Reveal from '@/components/Reveal';
export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<
    Array<{ src: string; alt: string; name?: string; width?: number; height?: number; colSpan?: number; rowSpan?: number }>
  >([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ROW_HEIGHT = 8; // px, must match `grid-auto-rows` in CSS

  useEffect(() => {
    let mounted = true;

    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const { data: files, error } = await supabase.storage.from('gallery').list('', { limit: 200 });
        if (error) {
          console.error('Error listing gallery files:', error);
          setGalleryImages([]);
          setIsLoading(false);
          return;
        }

        const rawImages = await Promise.all(
          (files || []).map(async (file: any) => {
            // Try public URL first
            const publicRes = supabase.storage.from('gallery').getPublicUrl(file.name as string);
            // supabase client may return shape { data: { publicUrl } } or { publicURL }
            // handle both possibilities
            // @ts-ignore
            const publicUrl = publicRes?.data?.publicUrl || publicRes?.data?.publicURL || publicRes?.publicUrl || publicRes?.publicURL || '';

            let url = publicUrl as string;

            if (!url) {
              // Fallback to signed URL (1 hour)
              const { data: signedData, error: signedError } = await supabase.storage
                .from('gallery')
                .createSignedUrl(file.name as string, 60 * 60);
              if (signedError) {
                console.error('Error creating signed URL for', file.name, signedError);
              } else {
                // @ts-ignore
                url = signedData?.signedUrl || '';
              }
            }

            return { src: url, alt: file.name, name: file.name };
          })
        );

        // Load natural image dimensions so we can size items by aspect ratio
        const images = await Promise.all(
          (rawImages || [])
            .filter((i) => i.src)
            .map(async (img) => {
              try {
                const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
                  const tmp = new window.Image();
                  tmp.src = img.src;
                  tmp.onload = () => resolve({ width: tmp.naturalWidth || tmp.width, height: tmp.naturalHeight || tmp.height });
                  tmp.onerror = (e) => reject(e);
                });

                const aspect = dims.width / Math.max(dims.height, 1);
                // Determine column span based on aspect ratio. Wide images get more columns.
                let colSpan = 1;
                if (aspect >= 1.6) colSpan = 3;
                else if (aspect >= 1.1) colSpan = 2;
                else colSpan = 1;

                return { ...img, width: dims.width, height: dims.height, colSpan };
              } catch (err) {
                // If we can't get dimensions, fall back to 1:1
                return { ...img, width: 1, height: 1, colSpan: 1 };
              }
            })
        );

        if (mounted) {
          setGalleryImages(images);
        }
      } catch (err) {
        console.error('Unexpected error fetching gallery images:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchImages();

    return () => {
      mounted = false;
    };
  }, []);

 
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const computeSpans = () => {
      if (!container) return;
      const style = window.getComputedStyle(container);
      const template = style.gridTemplateColumns || '';
      const columnCount = template ? template.split(' ').length : 2;
      const gap = parseInt(style.columnGap || style.gap || '8', 10) || 8;
      const containerWidth = container.clientWidth;
      const colWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;

      setGalleryImages((prev) =>
        prev.map((img) => {
          const colSpan = img.colSpan || 1;
          const width = colWidth * colSpan + gap * (colSpan - 1);
          const height = img.width && img.height ? (img.height / img.width) * width : colWidth;
          // Each grid row has height ROW_HEIGHT and rows are separated by `gap`.
          // An item spanning N rows occupies N*ROW_HEIGHT + (N-1)*gap vertical space.
          // Solve N >= (height + gap) / (ROW_HEIGHT + gap)
          const rowSpan = Math.max(1, Math.ceil((height + gap) / (ROW_HEIGHT + gap)));
          return { ...img, rowSpan };
        })
      );
    };

    const ro = new ResizeObserver(() => computeSpans());
    ro.observe(container);
    window.addEventListener('resize', computeSpans);
    computeSpans();

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeSpans);
    };
  }, [galleryImages.length]);


  return (
    <main className={styles.container}>
    
      <h1 className={styles.title}>Our Gallery</h1>
      <p className={styles.subtitle}>
        A glimpse of our images
      </p>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}>Loading...</div>
        </div>
      ) : galleryImages.length > 0 ? (
        <div ref={containerRef} className={styles.galleryContainer}>
          {galleryImages.map((image) => (
            <div
              key={image.src}
              className={styles.imageItem}
              style={{ gridColumn: `span ${image.colSpan || 1}`, gridRow: `span ${image.rowSpan || 1}` }}
            >
              <div
                className={styles.imageWrapper}
                onClick={() => setSelectedImage(image.src)}
                style={image.width && image.height ? { aspectRatio: `${Math.round(image.width)}/${Math.round(image.height)}` } : undefined}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  unoptimized
                  className={styles.image}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.emptyText}>
          The gallery is currently empty.
        </p>
      )}

      {selectedImage && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage}
              alt="Enlarged gallery image"
              fill
              unoptimized
              className={styles.enlargedImage}
            />
            <button
              className={styles.closeButton}
              onClick={() => setSelectedImage(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>
      )}
     
    </main>
  );
}