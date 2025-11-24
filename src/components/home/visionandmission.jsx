'use client'
import React, { useState, useEffect } from 'react';
import './home.css';

const VisionAndMission = () => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="vision-container">
      <div className={`vision-content-container${isDesktop ? ' vision-content-container-desktop' : ''}`}>
        <div className="vision-section">
          <h2 className="vision-main-title">Our Vision</h2>
          <p className="vision-section-text">
            We aim to become one of the continent's leading platforms that inspires excellence, shapes young people into influential voices for society through enlightenment and education fueled by creativity and enriched with entertainment
          </p>
        </div>
        <div className="vision-section">
          <h2 className="vision-main-title">Our Mission</h2>
          <p className="vision-section-text">
            Our mission is to create a transformative pageant experience that empowers contestants through mentorship, skill development, and community engagement. We aim to provide a stage where every participant can shine, inspire others, and become an ambassador for positive change, creativity, and unity in Nigeria and beyond.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VisionAndMission;