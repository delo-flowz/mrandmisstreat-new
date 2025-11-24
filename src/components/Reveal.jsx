"use client";
import React, { useEffect, useRef } from "react";
import styles from "./reveal.module.css";

export default function Reveal({ children, threshold = 0.15, rootMargin = "0px 0px -10% 0px", stagger = 150 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const nodes = container.querySelectorAll(`.${styles.hidden}`);
    nodes.forEach((n) => observer.observe(n));

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={containerRef} className={styles.reveal}>
      {React.Children.map(children, (child, i) => (
        <div
          className={styles.hidden}
          key={i}
          style={{ transitionDelay: `${i * stagger}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
