'use client';

import Image from 'next/image';
import styles from './Footer.module.css';
// Unused icons removed

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.content}`}>
                <div className={styles.footerBrandSection}>
                    <div className={styles.logoWrapper}>
                        <Image src="/MRANTI.png" alt="MRANTI Logo" width={200} height={60} className={styles.footerLogo} />
                    </div>
                    <h2 className={styles.portalTitle}>Malaysian R&D Commercialisation Portal</h2>
                    <p className={styles.portalDescription}>
                        Our portal serves as a strategic bridge, connecting high-impact research with industry needs.
                        We focus on transforming academic breakthroughs into commercial realities that drive national economic growth.
                    </p>
                </div>

                <div className={styles.bottomBar}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Malaysian R&D Commercialisation Portal. All rights reserved.
                    </p>
                    <div className={styles.bottomLinks}>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
