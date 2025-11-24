'use client';

import React from 'react';
import Socialhandle from './socialhandle';
import styles from './footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.con}>
      <Socialhandle />
      <div className={styles.container}>
        <p className={styles.copyrightText}>
          © {new Date().getFullYear()} Mr & Miss Treat Nigeria. All Rights Reserved.
        </p>
        <div className={styles.linksContainer}>
          <a
            href="https://wa.me/08100722727"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkText}
          >
            web developed by joseph
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;