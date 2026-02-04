'use client';

import Image from 'next/image';
import styles from './MissionSection.module.css';

const MISSIONS = [
    {
        title: "Future of Healthcare",
        subtitle: "Revolutionising healthcare by matching clinical R&D with providers to build a resilient, tech-driven medical ecosystem.",
        image: "/healthcare.jpg"
    },
    {
        title: "Next-Gen Agriculture",
        subtitle: "Strengthening food security by connecting technologies from R&D with real-world agricultural demands.",
        image: "/agritech.jpg"
    },
    {
        title: "Autonomous Living",
        subtitle: "Powering the cities of tomorrow by matching automation, sensors, and AI R&D with smart urban infrastructure.",
        image: "/smartcity.jpg"
    }
];

export default function MissionSection() {
    return (
        <section id="missions" className={styles.missionSection}>
            <div className={`container`}>
                <div className={styles.header}>

                    <h2 className="heading-lg">
                        Transforming priority sectors through <span className="text-gradient">Mission Oriented Projects</span>
                    </h2>
                </div>

                <div className={styles.grid}>
                    {MISSIONS.map((mission, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={mission.image}
                                    alt={mission.title}
                                    fill
                                    className={styles.image}
                                />
                                <div className={styles.imageOverlay} />
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{mission.title}</h3>
                                <p className={styles.cardSubtitle}>{mission.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
