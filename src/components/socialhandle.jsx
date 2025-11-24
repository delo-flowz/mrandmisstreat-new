'use client';

import React from 'react';
import Image from 'next/image';
import styles from './socialhandle.module.css';

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/movietreat_podcast/',
    icon: '/images/socials/instagram.png',
    username: '@movietreat_podcast',
  },
  {
    name: 'Facebook',
    url: 'https://web.facebook.com/MovietreatPodcast/',
    icon: '/images/socials/facebook.png',
    username: 'Funnyoracle1',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/channel/UCVShQOsV0d1S8DXGZnrEl0w',
    icon: '/images/socials/youtube.png',
    username: 'funnyoracle_tv',
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@movietreatpodcast',
    icon: '/images/socials/tiktok.png',
    username: '@movietreat_podcast',
  },
];

const Socialhandle = () => {
  const handlePress = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Follow Us</h2>
      <div className={styles.iconsContainer}>
        {socialLinks.map((social) => (
          <button
            key={social.name}
            onClick={() => handlePress(social.url)}
            className={styles.socialItem}
            aria-label={`Follow on ${social.name}`}
          >
            <Image
              src={social.icon}
              alt={social.name}
              width={40}
              height={40}
              className={styles.icon}
            />
            <p className={styles.usernameText}>{social.username}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Socialhandle;