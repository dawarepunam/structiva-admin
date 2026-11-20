'use client';

import React from 'react';
import styles from '../styles/HomeProcess.module.css';
import { 
  Compass, 
  Cog, 
  Gauge, 
  ClipboardCheck, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HomeProcess() {
  const steps = [
    {
      step: '01',
      phase: 'PHASE',
      title: 'Plan',
      subtitle: 'THOROUGH ENGINEERING PREPARATION',
      desc: 'Rigorous site surveying, geotechnical assessment, route profile validation, equipment mobilization, and HSE risk protocols before ground breaking.',
      icon: Compass,
      status: 'active'
    },
    {
      step: '02',
      phase: 'PHASE',
      title: 'Execute',
      subtitle: 'MACHINE & MANUAL PRECISION',
      desc: 'Deployment of heavy earthmovers, automated butt fusion rigs, pneumatic DTH pilers, and skilled ground crews to execute works to millimeter tolerances.',
      icon: Cog,
      status: 'active'
    },
    {
      step: '03',
      phase: 'PHASE',
      title: 'Test',
      subtitle: 'PRESSURE & STRUCTURAL VALIDATION',
      desc: 'Hydrostatic pressure testing of pipelines, pull-out torque checks on solar pilings, holiday testing on coatings, and ultrasonic weld inspections.',
      icon: Gauge,
      status: 'highlight'
    },
    {
      step: '04',
      phase: 'PHASE',
      title: 'Inspect',
      subtitle: 'QUALITY ASSURANCE & COMPLIANCE',
      desc: 'Joint inspection with client engineers, third-party audits, compliance sign-offs with ISO 9001/14001/45001 standards, and defect checks.',
      icon: ClipboardCheck,
      status: 'active'
    },
    {
      step: '05',
      phase: 'PHASE',
      title: 'Complete',
      subtitle: 'COMMISSIONING & HANDOVER',
      desc: 'Trench backfilling, surface restoration, documentation submission (as-built drawings & test logs), and responsible handover to EPC clients.',
      icon: CheckCircle2,
      status: 'active'
    }
  ];

  return (
    <section className={styles.processSection}>
      <div className={styles.container}>
        {/* Header matching user image */}
        <div className={styles.headerRow}>
          <div className={styles.methodologyPill}>
            <Sparkles size={14} className={styles.pillIcon} />
            <span>OUR 5-STEP METHODOLOGY</span>
          </div>

          <h2 className={styles.flowTitle}>
            <span>Plan</span>
            <span className={styles.arrow}>→</span>
            <span>Execute</span>
            <span className={styles.arrow}>→</span>
            <span>Test</span>
            <span className={styles.arrow}>→</span>
            <span>Inspect</span>
            <span className={styles.arrow}>→</span>
            <span className={styles.completeHighlight}>Complete</span>
          </h2>

          <p className={styles.sectionSubtitle}>
            Every infrastructure contract at STRUCTIVA follows our disciplined multi-stage execution framework to ensure timely and zero-tolerance delivery.
          </p>
        </div>

        {/* 5-Phase Horizontal Timeline Flow */}
        <div className={styles.flowContainer}>
          <div className={styles.flowTrackLine} />

          <div className={styles.stepsRow}>
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isHighlight = item.status === 'highlight';

              return (
                <div key={item.step} className={styles.stepColumn} style={{ animationDelay: `${idx * 120}ms` }}>
                  {/* Phase Label Above Circle */}
                  <div className={styles.phaseIndicator}>
                    <span className={styles.stepNum}>{item.step}</span>
                    <span className={styles.phaseText}>{item.phase}</span>
                  </div>

                  {/* Connected Animated Circle Node */}
                  <div className={styles.nodeWrapper}>
                    <div className={`${styles.circleNode} ${isHighlight ? styles.circleNodeHighlight : ''}`}>
                      <Icon size={22} className={styles.nodeIcon} />
                      <div className={styles.pulseRing} />
                    </div>
                  </div>

                  {/* Phase Content Below */}
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>{item.title}</h3>
                    <div className={styles.stepSubtitle}>{item.subtitle}</div>
                    <p className={styles.stepDesc}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
