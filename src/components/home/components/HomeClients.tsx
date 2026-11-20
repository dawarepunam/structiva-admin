'use client';

import React, { useState } from 'react';
import styles from '../styles/HomeClients.module.css';
import { Handshake, Building2 } from 'lucide-react';
import { StrapiClientData } from '../types/homeTypes';

interface HomeClientsProps {
  clients: StrapiClientData[];
}

export default function HomeClients({ clients }: HomeClientsProps) {
  const [activeSector, setActiveSector] = useState<'All' | 'Solar EPC' | 'Water Infrastructure'>('All');

  const filteredClients = activeSector === 'All'
    ? clients
    : clients.filter((c) => c.sector === activeSector);

  return (
    <section id="clients" className={styles.clientsSection}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.sectionPill}>
            <Handshake size={16} />
            <span>Trusted EPC Partnerships</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Engineering for India's Foremost Infrastructure Developers
          </h2>
          <p className={styles.sectionSubtitle}>
            Proudly delivering high-consequence water transmission networks and GW-scale utility solar projects alongside top-tier corporate & government authorities.
          </p>
        </div>

        {/* Sector Tabs */}
        <div className={styles.sectorTabs}>
          <button 
            className={`${styles.tabBtn} ${activeSector === 'All' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveSector('All')}
          >
            All Enterprise Partners ({clients.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeSector === 'Solar EPC' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveSector('Solar EPC')}
          >
            Solar EPC Giants (10)
          </button>
          <button 
            className={`${styles.tabBtn} ${activeSector === 'Water Infrastructure' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveSector('Water Infrastructure')}
          >
            Water Infrastructure Leaders (10)
          </button>
        </div>

        {/* Clients Grid */}
        <div className={styles.clientsGrid}>
          {filteredClients.map((client) => (
            <div key={client.id} className={styles.clientCard}>
              <div className={styles.clientBadge}>
                {client.logo || client.name.substring(0, 3).toUpperCase()}
              </div>
              <div className={styles.clientName}>{client.name}</div>
              <div className={styles.clientSector}>{client.sector}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
