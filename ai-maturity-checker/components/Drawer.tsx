'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/drawer.module.css';
import Link from 'next/link';

const Drawer = ({email} : {email : string}) => {
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

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/signin'; // redirect after logout
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to log out');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Something went wrong while logging out.');
    }
  };

  return (
    <>
      <button className={styles.hamburger} onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* Overlay (only visible when open on mobile) */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

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
        <Link href="/home" onClick={handleNavClick}>
          <div className={styles.navItem}>Home</div>
        </Link>
        <Link href="/signin" onClick={handleNavClick}>
          <div className={styles.navItem}>Sign in / Sign up</div>
        </Link>
        <hr />
        <h3>AI report steps</h3>
        <Link href="/questions" onClick={handleNavClick}>
          <div className={styles.navItem}>1. Questions</div>
        </Link>
        <Link href="/results" onClick={handleNavClick}>
          <div className={styles.navItem}>2. Results &amp; save priorities</div>
        </Link>
        <Link href="/profile" onClick={handleNavClick}>
          <div className={styles.navItem}>3. Analysis & Planning</div>
        </Link>
        <Link href="/recommendations" onClick={handleNavClick}>
          <div className={styles.navItem}>4. Get recommendations</div>
        </Link>

        <hr />
        <div className={styles.signedInAs}>Signed in as: {email}</div>
        <button
          className={styles.navItem}
          onClick={() => {
            setOpen(false); // close drawer on mobile
            handleLogout();
          }}
        >
          Log Out
        </button>
      </nav>
    </>
  );
};

export default Drawer;
