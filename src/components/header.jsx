'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from './header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(true);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Register', href: '/register' },
    { name: 'Contact', href: '/contact' },
  ];

  const NavLinks = () => (
    <nav className={isDesktop ? styles.navContainerDesktop : styles.mobileNavLinksContainer}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`${styles.navLink} ${isDesktop ? styles.navLinkDesktop : styles.navLinkMobile} ${
              hoveredItem === item.name && isDesktop ? styles.navLinkDesktopHovered : ''
            } ${isActive ? (isDesktop ? styles.navLinkDesktopActive : styles.navLinkMobileActive) : ''}`}
            onMouseEnter={() => isDesktop && setHoveredItem(item.name)}
            onMouseLeave={() => isDesktop && setHoveredItem(null)}
            onClick={() => isMenuOpen && setIsMenuOpen(false)}
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

      {isDesktop ? (
        <NavLinks />
      ) : (
        <>
          <button
            className={styles.menuIconContainer}
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
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
                  <NavLinks />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </header>
  );
};

export default Header;