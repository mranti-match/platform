'use client';

import { useEffect, useState } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.pageYOffset);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className={styles.hero}>
            <video
                autoPlay
                muted
                loop
                playsInline
                className={styles.videoBg}
                style={{
                    transform: `translateY(${offset * 0.4}px)`
                }}
            >
                <source src="/background-3d-hero.mp4" type="video/mp4" />
            </video>
            <div className={styles.overlay} />
            <div className={`container ${styles.content}`}
                style={{
                    transform: `translateY(${offset * -0.15}px)`,
                    opacity: Math.max(0, 1 - offset / 800)
                }}
            >
                <div className={styles.textContent}>
                    <h1 className={styles.title}>
                        <span className={styles.titleThin}>Bridge the Gap Between</span>
                        <span className={styles.titleBold}>Research and Market Reality</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Accelerating Malaysia’s innovation economy by synchronizing cutting-edge research
                        with the problem statements that matter most.
                    </p>
                </div>
            </div>
        </section>
    );
}
