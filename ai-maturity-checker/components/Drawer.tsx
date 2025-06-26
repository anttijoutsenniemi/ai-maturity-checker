'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/drawer.module.css';
import Link from 'next/link';

const Drawer = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMedia = () => setIsMobile(window.innerWidth <= 768);
    updateMedia();
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  return (
    <>
      <button className={styles.hamburger} onClick={() => setOpen(!open)}>
        ☰
      </button>
      <nav
        className={`${styles.drawer} ${
            isMobile ? styles.drawerMobile : ''
        } ${
            open
            ? isMobile
                ? styles.drawerMobileVisible
                : styles.drawerVisible
            : isMobile
            ? styles.drawerMobileHidden
            : styles.drawerHidden
        }`}
        >
        <div className={styles.navItem}><Link href="/">Home</Link></div>
        <div className={styles.navItem}><Link href="/questions">Questions</Link></div>
        <div className={styles.navItem}><Link href="/progress">See your progress</Link></div>
        <div className={styles.navItem}><Link href="/route3">Route 3</Link></div>
      </nav>
    </>
  );
};

export default Drawer;
