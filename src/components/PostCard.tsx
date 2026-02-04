import Link from 'next/link';
import Image from 'next/image';
import styles from './PostCard.module.css';

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    tags?: string[];
}

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={post.coverImage || '/placeholder.jpg'}
                    alt={post.title}
                    width={600}
                    height={400}
                    className={styles.image}
                />
            </div>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <h3 className={styles.title}>{post.title}</h3>
                    <span className={styles.arrow}>↗</span>
                </div>
                <p className={styles.excerpt}>{post.excerpt}</p>
                <div className={styles.tags}>
                    {post.tags?.map((tag) => (
                        <span key={tag} className={styles.tag}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
