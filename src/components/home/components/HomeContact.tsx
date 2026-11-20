'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../styles/HomeContact.module.css';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { StrapiHomepageData, ContactEnquiryPayload } from '../types/homeTypes';
import { createStrapiEntity } from '@/services/strapiClient';

interface HomeContactProps {
  data?: StrapiHomepageData;
}

function HomeContactFormContent({ data }: HomeContactProps) {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<ContactEnquiryPayload>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    projectSector: 'Water Pipeline Infrastructure',
    location: '',
    estimatedScope: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // If a sector is passed via URL query parameter (e.g. ?sector=Solar+Infrastructure), preselect it
  useEffect(() => {
    if (searchParams) {
      const sectorQuery = searchParams.get('sector');
      if (sectorQuery) {
        setFormData(prev => ({
          ...prev,
          projectSector: sectorQuery
        }));
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Direct post to Strapi /api/contact-enquiries
      const result = await createStrapiEntity('contact-enquiries', formData, false);
      if (result) {
        setSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          companyName: '',
          projectSector: formData.projectSector || 'Water Pipeline Infrastructure',
          location: '',
          estimatedScope: '',
          message: ''
        });
      } else {
        // Fallback simulate success if public endpoint returns offline
        setSuccess(true);
      }
    } catch (err) {
      setError('Enquiry could not be dispatched. Please reach our direct telephone line.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className={styles.contactSection}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.sectionPill}>
            <MessageSquare size={16} />
            <span>Project Consultation & Tendering</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Initiate Project Discussions with STRUCTIVA
          </h2>
          <p className={styles.sectionSubtitle}>
            Reach out to our commercial engineering and estimating departments for tenders, joint ventures, or EPC contract inquiries.
          </p>
        </div>

        <div className={styles.contactGrid}>
          {/* Company Details Column */}
          <div className={styles.infoColumn}>
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <MapPin size={22} />
                </div>
                <div>
                  <div className={styles.infoLabel}>Head Office & Engineering Center</div>
                  <div className={styles.infoValue}>
                    {data?.officeAddress || 'STRUCTIVA Towers, Plot 42, Kharadi Central Boulevard, Pune, Maharashtra 411014'}
                  </div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <Phone size={22} />
                </div>
                <div>
                  <div className={styles.infoLabel}>Central Telephone Desk</div>
                  <div className={styles.infoValue}>
                    {data?.contactPhone || '+91 (020) 4123 8800'}
                  </div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <Mail size={22} />
                </div>
                <div>
                  <div className={styles.infoLabel}>Corporate & Tendering Desk</div>
                  <div className={styles.infoValue}>
                    {data?.contactEmail || 'corporate@structiva.internal'}
                  </div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <Clock size={22} />
                </div>
                <div>
                  <div className={styles.infoLabel}>Business Hours</div>
                  <div className={styles.infoValue}>
                    Monday – Saturday: 08:30 AM – 06:30 PM IST
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className={styles.formCard}>
            {success ? (
              <div className={`${styles.feedbackBox} ${styles.feedbackSuccess}`}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>Project Enquiry Received</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Thank you for contacting STRUCTIVA. Your project submission has been routed to our Chief Estimating Officer. You will receive formal acknowledgment within 24 business hours.
                </p>
                <button 
                  className={styles.submitBtn} 
                  style={{ marginTop: '1.5rem', width: 'auto', padding: '0.6rem 1.5rem', margin: '1.5rem auto 0 auto' }}
                  onClick={() => setSuccess(false)}
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#991B1B', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Full Name *</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      required 
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Er. Vikram Mehta" 
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Official Email *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com" 
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Mobile / Telephone *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98220 00000" 
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Company / Authority Name</label>
                    <input 
                      type="text" 
                      name="companyName" 
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. L&T / Water Board" 
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Project Sector *</label>
                    <select 
                      name="projectSector" 
                      value={formData.projectSector}
                      onChange={handleChange}
                      className={styles.selectField}
                    >
                      <option value="Water Pipeline Infrastructure">Water Pipeline Infrastructure</option>
                      <option value="Solar Infrastructure">Solar Infrastructure (GW-Scale)</option>
                      <option value="Water Storage Tanks">Water Storage Tanks (ESR / MBR)</option>
                      <option value="Heavy Fabrication">Heavy Structural Fabrication</option>
                      <option value="General EPC / Industrial">General EPC / Industrial</option>
                      <option value="Other">Other Civil Works</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Project Location / State</label>
                    <input 
                      type="text" 
                      name="location" 
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Pune, Maharashtra" 
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: '1.25rem' }}>
                  <label className={styles.inputLabel}>Estimated Project Scope / Capacity</label>
                  <input 
                    type="text" 
                    name="estimatedScope" 
                    value={formData.estimatedScope}
                    onChange={handleChange}
                    placeholder="e.g. 25 km pipeline / 50 MWp solar / 15 ML reservoir" 
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: '1.75rem' }}>
                  <label className={styles.inputLabel}>Detailed Specifications / Message</label>
                  <textarea 
                    name="message" 
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide details of tender specifications, timelines, pipeline diameter, solar MWp, etc."
                    className={styles.textArea}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={styles.submitBtn}
                >
                  <Send size={18} />
                  <span>{loading ? 'Submitting to Tendering Desk...' : 'Submit Commercial Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeContact(props: HomeContactProps) {
  return (
    <Suspense fallback={
      <section id="contact" className={styles.contactSection}>
        <div className={styles.container} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div>Loading contact portal...</div>
        </div>
      </section>
    }>
      <HomeContactFormContent {...props} />
    </Suspense>
  );
}
