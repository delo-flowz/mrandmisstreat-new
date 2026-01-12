'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from './header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Vote', href: '/vote' },
    { name: 'Buy Ticket', href: '/ticket' },
    { name: 'Register', href: '/register' },
    { name: 'Contact', href: '/contact' },
  ];

  const NavLinks = ({ isMobile = false }) => (
    <nav className={isMobile ? styles.mobileNavLinksContainer : styles.navContainer}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className={styles.headerContainer}>
      <Link href="/" className={styles.logoLink}>
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={120}
          height={50}
          style={{ objectFit: 'contain' }}
        />
      </Link>

      <NavLinks />

      <button
        className={`${styles.menuIconContainer} ${isMenuOpen ? styles.menuIconOpen : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={styles.menuIcon}>☰</span>
      </button>

      {isMenuOpen && (
        <>
          <div
            className={styles.modalBackdrop}
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className={styles.mobileMenuContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeButton}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <span className={styles.closeButtonText}>✕</span>
              </button>
              <NavLinks isMobile={true} />
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;