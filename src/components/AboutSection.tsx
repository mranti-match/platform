'use client';

import Image from 'next/image';
import styles from './AboutSection.module.css';

export default function AboutSection() {
    return (
        <section id="about" className={styles.missionSection}>
            <div className={`container ${styles.content}`}>
                <div className={styles.grid}>
                    <div className={styles.textSide}>

                        <h2 className="heading-lg">Pioneering the Future of <span className="text-gradient">R&D Commercialisation</span></h2>
                        <p className={styles.description}>
                            Our portal serves as a strategic bridge, connecting high-impact research
                            with industry needs. We focus on transforming academic breakthroughs into
                            commercial realities that drive national economic growth.
                        </p>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>500+</span>
                                <span className={styles.statLabel}>Patents Matched</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>RM 2B+</span>
                                <span className={styles.statLabel}>Market Valuation</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>120+</span>
                                <span className={styles.statLabel}>Active Missions</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.visualSide}>
                        <div className={styles.imageContainer}>
                            <div className={styles.circularWrapper}>
                                <Image
                                    src="/about-researcher.jpg"
                                    alt="Researcher"
                                    fill
                                    className={styles.aboutImage}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
