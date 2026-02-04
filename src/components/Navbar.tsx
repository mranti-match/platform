'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : styles.transparent}`}>
      <div className={`container ${styles.content}`}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <Image src="/logo.png" alt="Logo" width={32} height={32} className={styles.navLogo} />
          R&D Commercialisation
        </Link>

        <button
          className={`${styles.burger} ${isMenuOpen ? styles.burgerActive : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`${styles.navLinks} ${isMenuOpen ? styles.navActive : ''}`}>
          <Link href="/#about" className={styles.link} onClick={closeMenu}>
            About
          </Link>
          <Link href="/#missions" className={styles.link} onClick={closeMenu}>
            Missions
          </Link>
          <Link href="/#insights" className={styles.link} onClick={closeMenu}>
            Insights
          </Link>
          <Link href="/rd-products" className={styles.link} onClick={closeMenu}>
            R&D Products
          </Link>
          {user ? (
            <Link href="/admin" className={styles.loginBtn} onClick={closeMenu}>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className={styles.loginBtn} onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
