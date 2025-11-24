import React from 'react';
import styles from './home.module.css';

const Getintouch = () => {
  return (
    <section className={styles.getintouchContainer}>
      <div className={styles.getintouchContent}>
        <div className={styles.getintouchSection}>
          <h2 className={styles.getintouchTitle}>CONTACT US</h2>

          <a href="mailto:movietreatpodcast@gmail.com" className={styles.contactItem}>
            <span className={styles.contactLabel}>Email</span>
            <span className={styles.contactValue}>movietreatpodcast@gmail.com</span>
          </a>

          <a href="https://wa.me/2348136398336" className={styles.contactItem} target="_blank" rel="noopener noreferrer">
            <span className={styles.contactLabel}>WhatsApp</span>
            <span className={styles.contactValue}>+234 813 639 8336</span>
            <span className={styles.contactNote}>WhatsApp messages only</span>
          </a>
        </div>

        <div className="getintouch-section">
          <h2 className="getintouch-title">FOLLOW US</h2>
          <div className={styles.socials}>
            <a href="https://www.instagram.com/movietreat_podcast/" className={styles.socialLink} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://web.facebook.com/MovietreatPodcast/" className={styles.socialLink} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.tiktok.com/@movietreatpodcast" className={styles.socialLink} target="_blank" rel="noopener noreferrer">Tiktok</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Getintouch;