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

  const handleNavClick = () => {
    setOpen(false); // close on mobile after nav click
  };

  return (
    <>
      <button className={styles.hamburger} onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* Overlay (only visible when open on mobile) */}
      {open && (
        <div
          className={styles.overlay}
          onClick={() => setOpen(false)}
        />
      )}

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
        <Link href="/" onClick={handleNavClick}>
          <div className={styles.navItem}>Home</div>
        </Link>
        <hr />
        <h3>AI report steps</h3>
        <Link href="/questions" onClick={handleNavClick}>
          <div className={styles.navItem}>1. Questions</div>
        </Link>
        <Link href="/progress" onClick={handleNavClick}>
          <div className={styles.navItem}>2. See your progress</div>
        </Link>
        <Link href="/results" onClick={handleNavClick}>
          <div className={styles.navItem}>3. Results &amp; save priorities</div>
        </Link>
        <Link href="/profile" onClick={handleNavClick}>
          <div className={styles.navItem}>4. AI maturity report</div>
        </Link>
        <hr />
        <h3>Reassessment steps</h3>
        <Link href="/roadmap" onClick={handleNavClick}>
          <div className={styles.navItem}>5. Roadmap</div>
        </Link>
      </nav>
    </>
  );
};

export default Drawer;
