'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HomeHeader from '@/components/home/components/HomeHeader';
import HomeFooter from '@/components/home/components/HomeFooter';
import { fetchStrapiCollection } from '@/services/strapiClient';
import { StrapiProjectData } from '@/components/home/types/homeTypes';
import { defaultEnterpriseProjects } from '@/services/projectStorage';
import { Building2, MapPin, ArrowRight, Lock, Filter, ShieldCheck } from 'lucide-react';

const fallbackProjects: StrapiProjectData[] = defaultEnterpriseProjects.map(p => ({
  id: Number(p.id),
  name: p.name,
  code: p.code,
  slug: p.slug,
  client: p.client,
  location: p.location,
  category: p.category || 'Commercial Building',
  budget: String(p.budget),
  spent: String(p.spent),
  status: p.status,
  progress: p.progress,
  startDate: p.startDate,
  expectedCompletion: p.expectedCompletion,
  image: p.image,
  description: p.description,
  deployedMachinery: p.deployedMachinery,
  isProtected: p.isProtected
}));

export default function ProjectsDirectoryPage() {
  const [projects, setProjects] = useState<StrapiProjectData[]>(fallbackProjects);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStrapiCollection<StrapiProjectData>('projects', fallbackProjects)
      .then((data) => {
        if (data && data.length > 0) setProjects(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    'All', 
    'Water Pipeline Infrastructure', 
    'Solar Infrastructure', 
    'Water Storage Tanks', 
    'Heavy Fabrication', 
    'Commercial Building', 
    'Highway Infrastructure',
    'Metro Rail Transit'
  ];

  const filtered = selectedCategory === 'All'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', color: '#172B32', paddingTop: '80px' }}>
      <HomeHeader />

      {/* Hero Header */}
      <section style={{ background: '#172B32', color: '#FFFFFF', padding: '80px 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>
            <Building2 size={16} /> Infrastructure Portfolio
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>
            Verified Landmark Projects
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#ECEBE5', lineHeight: '1.6', margin: 0 }}>
            Inspect active EPC execution records, contract values, machinery deployment, and site progress tracking.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '60px 1.5rem' }}>
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#167C72' : '#D1D5DB',
                background: selectedCategory === cat ? '#167C72' : '#FFFFFF',
                color: selectedCategory === cat ? '#FFFFFF' : '#172B32',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
          {filtered.map((prj) => {
            const slug = prj.slug || prj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <div 
                key={prj.id} 
                style={{ background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}
              >
                <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={prj.image || '/images/commercial_tower.jpg'} 
                    alt={prj.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(23,43,50,0.85)', backdropFilter: 'blur(6px)', color: '#34D399', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {prj.category}
                  </span>
                  <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#167C72', color: '#FFF', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {prj.progress}% Done
                  </span>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#172B32', lineHeight: '1.3' }}>
                    {prj.name}
                  </h3>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} color="#167C72" /> {prj.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Building2 size={14} color="#B58B59" /> {prj.client}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.55', margin: '0 0 1.25rem 0', flex: 1 }}>
                    {prj.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '0.75rem', background: '#F8F9FA', borderRadius: '6px', marginBottom: '1.25rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#172B32' }}>₹{(Number(prj.budget || 0) / 10000000).toFixed(1)} Cr</div>
                      <div style={{ fontSize: '0.68rem', color: '#6B7280', textTransform: 'uppercase' }}>Budget</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#167C72' }}>{prj.deployedMachinery || 10} Plants</div>
                      <div style={{ fontSize: '0.68rem', color: '#6B7280', textTransform: 'uppercase' }}>Fleet</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>{prj.expectedCompletion || '2026'}</div>
                      <div style={{ fontSize: '0.68rem', color: '#6B7280', textTransform: 'uppercase' }}>Target</div>
                    </div>
                  </div>

                  <Link 
                    href={`/projects/${slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#172B32',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Lock size={15} color="#B58B59" />
                    <span>View Protected Project Dossier</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}
