'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './SponsorsSection.module.css';

const sponsors = [
  { id: '1', image: '/images/sponsors/s1.jpg' },
  { id: '2', image: '/images/sponsors/s2.jpg' },
  { id: '3', image: '/images/sponsors/s3.jpg' },
  { id: '4', image: '/images/sponsors/s4.jpg' },
  { id: '5', image: '/images/sponsors/s5.jpg' },
  { id: '6', image: '/images/sponsors/s6.jpg' },
  { id: '7', image: '/images/sponsors/s7.jpg' },
  { id: '8', image: '/images/sponsors/s8.jpg' },
  { id: '9', image: '/images/sponsors/s9.jpg' },
  { id: '10', image: '/images/sponsors/s10.jpg' },
  { id: '11', image: '/images/sponsors/s11.jpg' },
];

const SponsorsSection = () => {
  const extendedSponsors = [...sponsors, ...sponsors];
  const scrollViewRef = useRef(null);
  const LOGO_WIDTH = 200;
  const GAP = 40;
  const TOTAL_LOGO_WIDTH = LOGO_WIDTH + GAP;
  const SCROLL_DISTANCE = sponsors.length * TOTAL_LOGO_WIDTH;
  const isUserInteracting = useRef(false);
  const scrollerRef = useRef(null);
  const scrollValueRef = useRef(0);
  const resumeTimeoutRef = useRef(null);

  const stopAutoScroll = useCallback(() => {
    if (scrollerRef.current) {
      cancelAnimationFrame(scrollerRef.current);
      scrollerRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();

    const scroll = () => {
      const el = scrollViewRef.current;
      if (!isUserInteracting.current && el) {
        el.scrollLeft = el.scrollLeft + 1;
        if (el.scrollLeft >= SCROLL_DISTANCE) {
          el.scrollLeft = el.scrollLeft - SCROLL_DISTANCE;
        }
        scrollValueRef.current = el.scrollLeft;
      }
      scrollerRef.current = requestAnimationFrame(scroll);
    };
    scrollerRef.current = requestAnimationFrame(scroll);
  }, [SCROLL_DISTANCE, stopAutoScroll]);

  // Keep internal ref synced when user scrolls (prevents jumps)
  const handleOnScroll = useCallback(() => {
    if (scrollViewRef.current) {
      scrollValueRef.current = scrollViewRef.current.scrollLeft % SCROLL_DISTANCE;
    }
  }, [SCROLL_DISTANCE]);

  useEffect(() => {
    // initialize internal scroll value to current position
    if (scrollViewRef.current) {
      scrollValueRef.current = scrollViewRef.current.scrollLeft % SCROLL_DISTANCE;
    }
    startAutoScroll();
    return () => {
      stopAutoScroll();
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [startAutoScroll, stopAutoScroll]);

  const pauseAutoScroll = useCallback(() => {
    isUserInteracting.current = true;
    stopAutoScroll();
    if (scrollViewRef.current) {
      // Keep the ref in the same coordinate space as the auto-scroller
      scrollValueRef.current = scrollViewRef.current.scrollLeft % SCROLL_DISTANCE;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, [stopAutoScroll]);

  const resumeAutoScroll = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isUserInteracting.current = false;
      startAutoScroll();
    }, 1500);
  }, [startAutoScroll]);

  const handleScrollBeginDrag = pauseAutoScroll;
  const handleScrollEndDrag = resumeAutoScroll;
  const handleTouchStart = pauseAutoScroll;
  const handleTouchEnd = resumeAutoScroll;
  const handleMouseEnter = pauseAutoScroll;
  const handleMouseLeave = resumeAutoScroll;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Our Valued Sponsors</h2>
      <div className={styles.logosContainer}>
        <div
          ref={scrollViewRef}
          className={styles.scrollContainer}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.scrollingLogos}>
            {extendedSponsors.map((sponsor, index) => (
              <Image
                key={`${sponsor.id}-${index}`}
                src={sponsor.image}
                alt={`Sponsor ${sponsor.id}`}
                width={200}
                height={100}
                className={styles.logo}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;