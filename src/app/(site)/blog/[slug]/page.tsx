import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { getPostBySlug } from '@/lib/posts';
import ViewTracker from '@/components/ViewTracker';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return (
            <div className={styles.errorView}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>← Back to Home</Link>
                    <h1 className="heading-lg" style={{ marginTop: '2rem' }}>Post Not Found</h1>
                    <p>The requested article could not be found.</p>
                </div>
            </div>
        );
    }

    const formattedDate = new Date(post.createdAt || 0).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isProject = post.categories?.some(cat => cat.toLowerCase() === 'projects');

    return (
        <article className={styles.articleBase}>
            {post.id && (
                <ViewTracker
                    postId={post.id}
                    postTitle={post.title}
                    coverImage={post.coverImage}
                    slug={post.slug}
                />
            )}
            {/* Full-width Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroImage}>
                    <Image
                        src={post.coverImage || '/cover.png'}
                        alt={post.title}
                        fill
                        priority
                    />
                </div>
                <div className={styles.heroOverlay} />

                <div className={`container ${styles.heroTop}`}>
                    <Link href={isProject ? "/projects" : "/"} className={styles.backLink}>
                        <span>←</span> Back to {isProject ? 'projects' : 'home'}
                    </Link>
                </div>

                <div className={`container ${styles.heroBottom}`}>
                    <div className={styles.date}>
                        <span>🗓️</span> {formattedDate}
                    </div>
                    <h1 className={styles.title}>{post.title}</h1>
                </div>
            </section>

            {/* Main Content Section */}
            <div className={styles.mainContainer}>
                <div className={styles.contentWrapper}>
                    <div className={styles.contentHeader}>
                        <div className={styles.excerpt}>
                            {post.excerpt || 'Discover the hidden details and stories behind this amazing journey.'}
                        </div>
                    </div>


                    <div className={styles.divider} />

                    {/* Nuclear Option: Inline Style Injection to Force CSS */}

                    <div
                        id="nuclear-fix"
                        className={`${styles.content} ${styles.richTextContent}`}
                        dangerouslySetInnerHTML={{
                            __html: post.content
                                .replace(/text-align:\s*justify/gi, 'text-align: left')
                                .replace(/text-align-last:\s*justify/gi, 'text-align-last: left')
                                .replace(/\u00AD/g, '') // Remove soft hyphens
                                .replace(/&shy;/g, '') // Remove HTML entity soft hyphens
                                .replace(/\u00A0/g, ' ') // Replace non-breaking spaces with normal space
                                .replace(/&nbsp;/g, ' ') // Replace HTML entity non-breaking spaces
                        }}
                    />
                </div>
            </div>
        </article>
    );

}
