'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import Link from 'next/link';
import Image from 'next/image';
import { DailyStats, CountryStat, PostView } from '@/lib/analytics';
import styles from './AnalyticsCharts.module.css';

interface Props {
    dailyStats: DailyStats[];
    countryStats: CountryStat[];
    topPosts: PostView[];
}

export function VisitorChart({ data }: { data: DailyStats[] }) {
    return (
        <div className={styles.chartWrapper}>
            <h3 className={styles.chartTitle}>Visitor Growth (Last 30 Days)</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={12}
                            tickFormatter={(str) => str.split('-').slice(1).join('/')}
                        />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <Tooltip
                            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#d946ef' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="visits"
                            stroke="#d946ef"
                            strokeWidth={3}
                            dot={{ fill: '#d946ef', r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function CountryStats({ data }: { data: CountryStat[] }) {
    const COLORS = ['#d946ef', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className={styles.chartWrapper}>
            <h3 className={styles.chartTitle}>Visitors by Country</h3>
            <div className={styles.countryList}>
                {data.length === 0 ? (
                    <p className={styles.empty}>No geographic data yet.</p>
                ) : (
                    data.slice(0, 5).map((item, index) => (
                        <div key={item.country} className={styles.countryItem}>
                            <div className={styles.countryInfo}>
                                <div className={styles.countryDot} style={{ background: COLORS[index % COLORS.length] }} />
                                <span className={styles.countryName}>{item.country}</span>
                            </div>
                            <span className={styles.countryCount}>{item.count}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function TopPostsList({ data }: { data: PostView[] }) {
    return (
        <div className={styles.chartWrapper}>
            <h3 className={styles.chartTitle}>Top 5 Posts</h3>
            <div className={styles.postList}>
                {data.length === 0 ? (
                    <p className={styles.empty}>No post views tracked yet.</p>
                ) : (
                    data.map((post, index) => {
                        // Create a robust fallback slug from title if missing
                        const fallbackSlug = post.title
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-');

                        const actualSlug = post.slug || fallbackSlug;

                        return (
                            <Link
                                key={post.postId}
                                href={`/blog/${actualSlug}`}
                                className={styles.postItem}
                                target="_blank"
                            >
                                <span className={styles.postRank}>#{index + 1}</span>
                                <div className={styles.postInfo}>
                                    <div className={styles.postTitle}>{post.title}</div>
                                    <div className={styles.postMeta}>
                                        <span className={styles.postViews}>{post.views} views</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
