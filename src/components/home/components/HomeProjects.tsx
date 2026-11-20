'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../styles/HomeProjects.module.css';
import { Building2, MapPin, ArrowRight, Lock } from 'lucide-react';
import { StrapiProjectData } from '../types/homeTypes';

interface HomeProjectsProps {
  projects: StrapiProjectData[];
}

export default function HomeProjects({ projects }: HomeProjectsProps) {
  return (
    <section id="projects" className={styles.projectsSection}>
      <div className={styles.projectsContainer}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.sectionPill}>
              <Building2 size={16} />
              <span>Verified Project Portfolio</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Benchmark Infrastructure in Execution
            </h2>
          </div>
          <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34D399', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem' }}>
            <span>Explore All Projects</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className={styles.projectsGrid}>
          {projects.map((prj) => {
            const projectSlug = prj.slug || prj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <div key={prj.id} className={styles.projectCard}>
                <div className={styles.imageContainer}>
                  <img
                    src={prj.image || '/images/commercial_tower.jpg'}
                    alt={prj.name}
                    className={styles.projectImg}
                  />
                  <span className={styles.categoryBadge}>{prj.category}</span>
                  <span className={styles.progressBadge}>{prj.progress}% Completed</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.projectTitle}>{prj.name}</h3>

                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <MapPin size={15} color="#34D399" />
                      <span>{prj.location}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Building2 size={15} color="#B58B59" />
                      <span>{prj.client}</span>
                    </div>
                  </div>

                  <p className={styles.projectDesc}>
                    {prj.description || 'Turnkey EPC execution with certified structural concrete, heavy earthmoving fleet, and QA/QC inspection regimes.'}
                  </p>

                  <div className={styles.statsBar}>
                    <div className={styles.statCol}>
                      <span className={styles.statVal}>₹{(Number(prj.budget || 142000000) / 10000000).toFixed(1)} Cr</span>
                      <span className={styles.statLabel}>Contract Value</span>
                    </div>
                    <div className={styles.statCol}>
                      <span className={styles.statVal}>{prj.deployedMachinery || 14} Units</span>
                      <span className={styles.statLabel}>Machinery Active</span>
                    </div>
                    <div className={styles.statCol}>
                      <span className={styles.statVal}>{prj.expectedCompletion || 'Dec 2026'}</span>
                      <span className={styles.statLabel}>Target Delivery</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link
                      href={`/projects/${projectSlug}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#34D399', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      <Lock size={14} color="#B58B59" />
                      <span>View Protected Project Dossier</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
