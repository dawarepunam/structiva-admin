'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles/HomeHeader.module.css';
import { HardHat, UserCheck, Menu, X } from 'lucide-react';

export default function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <HardHat size={22} />
          </div>
          <div className={styles.logoTextGroup}>
            <span className={styles.logoTitle}>STRUCTIVA</span>
            <span className={styles.logoSubtitle}>Engineering & Infra</span>
          </div>
        </Link>

        {/* Desktop Navigation - Linking to Dedicated Full-Stack Pages */}
        <nav className={styles.desktopNav}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}>
            Home
          </Link>
          <Link href="/about" className={`${styles.navLink} ${pathname === '/about' ? styles.navLinkActive : ''}`}>
            About
          </Link>
          <Link href="/services" className={`${styles.navLink} ${pathname === '/services' ? styles.navLinkActive : ''}`}>
            Services
          </Link>
          <Link href="/projects" className={`${styles.navLink} ${pathname === '/projects' ? styles.navLinkActive : ''}`}>
            Projects
          </Link>
          <Link href="/capabilities" className={`${styles.navLink} ${pathname === '/capabilities' ? styles.navLinkActive : ''}`}>
            Capabilities
          </Link>
          <Link href="/contact" className={`${styles.navLink} ${pathname === '/contact' ? styles.navLinkActive : ''}`}>
            Contact
          </Link>

          {/* Secure Operational Portals (Supervisor & Worker only - NO public admin) */}
          <div className={styles.authButtonGroup}>
            <Link href="/supervisor/login" className={styles.btnSupervisor} title="Supervisor Site Operations Portal">
              <UserCheck size={15} />
              <span>Supervisor</span>
            </Link>
            <Link href="/worker/login" className={styles.btnWorker} title="Worker Trade & Muster Portal">
              <HardHat size={15} />
              <span>Worker</span>
            </Link>
          </div>
        </nav>

        {/* Mobile Toggle Button */}
        <button 
          className={styles.mobileMenuToggle} 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${mobileOpen ? styles.mobileDrawerOpen : ''}`}>
        <Link href="/" className={styles.navLink} onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/about" className={styles.navLink} onClick={() => setMobileOpen(false)}>About</Link>
        <Link href="/services" className={styles.navLink} onClick={() => setMobileOpen(false)}>Services</Link>
        <Link href="/projects" className={styles.navLink} onClick={() => setMobileOpen(false)}>Projects</Link>
        <Link href="/capabilities" className={styles.navLink} onClick={() => setMobileOpen(false)}>Capabilities</Link>
        <Link href="/contact" className={styles.navLink} onClick={() => setMobileOpen(false)}>Contact</Link>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/supervisor/login" className={styles.btnSupervisor} style={{ flex: 1, justifyContent: 'center' }}>
            <UserCheck size={16} /> Supervisor
          </Link>
          <Link href="/worker/login" className={styles.btnWorker} style={{ flex: 1, justifyContent: 'center' }}>
            <HardHat size={16} /> Worker
          </Link>
        </div>
      </div>
    </header>
  );
}
