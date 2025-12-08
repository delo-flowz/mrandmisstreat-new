import React from 'react';
import styles from './votingbanner.module.css';

const VotingBanner = () => {
  return (
    <section className={styles.votingBanner}>
      <div className={styles.content}>
        <h2 className={styles.title}>Cast Your Vote!</h2>
        <p className={styles.description}>
          The power is in your hands! Support your favorite contestant and help them move one step closer to the crown.
        </p>
        <a href="/vote" className={styles.voteButton}>Vote Now</a>
      </div>
    </section>
  );
};

export default VotingBanner;