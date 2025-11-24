'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './home.css';

const registrationopen = false;
const RegisterSection = () => {
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
    <section className={`register-container${isDesktop ? ' register-container-desktop' : ''}`}> 
      <img
        src="/images/backgroundimage.png"
        alt="Background"
        className="register-bg-image"
      />
      <div className="register-overlay" />
      <div className="register-bottom-gradient" />
      <div className="register-text-container">
        <h2 className={`register-title${isDesktop ? ' register-text-align-left' : ''}`}>Welcome to Mr &amp; Miss Treat Nigeria</h2>
        <p className={`register-description${isDesktop ? ' register-text-align-left' : ''}`}>
          Mr &amp; Miss Treat Nigeria is a vibrant new parade show designed to showcase the beauty, confidence, and cultural pride of young Nigerians. More than just a pageant, it is a platform where contestants embody elegance, talent, and originality while carrying the values of unity and creativity.
          <br /><br />
          The show brings together participants from diverse backgrounds, giving them the opportunity to express their unique stories through fashion, performance, and cultural displays. Each parade is a celebration of Nigeria’s heritage blended with modern creativity — highlighting not only physical beauty but also character, intelligence, and community impact.
        </p>
      </div>
      <div className="register-image-and-button-container">
        <div className="register-image-container">
          <img src="/images/logo.png" alt="Logo" className="register-image" />
        </div>
        {registrationopen && (
          <Link href="/register">
            <button className="register-button">
              <span className="register-button-text">Register Now</span>
            </button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default RegisterSection;
