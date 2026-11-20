'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../styles/HomeFooter.module.css';
import { HardHat, UserCheck, ShieldCheck } from 'lucide-react';
import { StrapiHomepageData } from '../types/homeTypes';

interface HomeFooterProps {
  data?: StrapiHomepageData;
}

export default function HomeFooter({ data }: HomeFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <div className={styles.logoGroup}>
              <div className={styles.logoIcon}>
                <HardHat size={22} />
              </div>
              <div>
                <span className={styles.logoTitle}>STRUCTIVA</span>
                <span className={styles.logoSub}>Heavy Infrastructure & EPC</span>
              </div>
            </div>

            <p className={styles.brandDesc}>
              Engineering high-consequence water transmission, utility-scale solar farms, water storage reservoirs, and heavy fabrication with certified ISO quality regimes.
            </p>

            <div className={styles.portalCard}>
              <div className={styles.portalTitle}>Site Operations Staff Access</div>
              <div className={styles.portalLinks}>
                <Link href="/supervisor/login" className={styles.portalBtn}>
                  <UserCheck size={14} /> Supervisor Portal
                </Link>
                <Link href="/worker/login" className={styles.portalBtn}>
                  <HardHat size={14} /> Worker Portal
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.colTitle}>Company</h4>
            <ul className={styles.linkList}>
              <li><Link href="/about" className={styles.footerLink}>About Us</Link></li>
              <li><Link href="/services" className={styles.footerLink}>Core Services</Link></li>
              <li><Link href="/projects" className={styles.footerLink}>Project Portfolio</Link></li>
              <li><Link href="/capabilities" className={styles.footerLink}>Technical Capabilities</Link></li>
              <li><Link href="/contact" className={styles.footerLink}>Commercial Inquiry</Link></li>
            </ul>
          </div>

          {/* Services Verticals */}
          <div>
            <h4 className={styles.colTitle}>Business Sectors</h4>
            <ul className={styles.linkList}>
              <li><Link href="/services" className={styles.footerLink}>Water Pipeline Infrastructure</Link></li>
              <li><Link href="/services" className={styles.footerLink}>GW-Scale Solar Plants</Link></li>
              <li><Link href="/services" className={styles.footerLink}>Water Storage Reservoirs</Link></li>
              <li><Link href="/services" className={styles.footerLink}>Heavy Structural Fabrication</Link></li>
              <li><Link href="/services" className={styles.footerLink}>Heavy Plant Fleet Leasing</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className={styles.colTitle}>Corporate Office</h4>
            <div className={styles.contactBlock}>
              <div>{data?.officeAddress || 'STRUCTIVA Towers, Plot 42, Kharadi Central Boulevard, Pune 411014'}</div>
              <div><strong>Tel:</strong> {data?.contactPhone || '+91 (020) 4123 8800'}</div>
              <div><strong>Email:</strong> {data?.contactEmail || 'corporate@structiva.internal'}</div>
              <div style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                <ShieldCheck size={16} /> ISO 9001:2015 Certified
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div>
            © {new Date().getFullYear()} STRUCTIVA Infrastructure Corporation. All rights reserved.
          </div>
          <div>
            Engineered with Precision • Built for National Growth
          </div>
        </div>
      </div>
    </footer>
  );
}
