'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import MissionSection from '@/components/MissionSection';
import PostCard from '@/components/PostCard';
import styles from './page.module.css';
import { getAllPosts, BlogPost } from '@/lib/posts';

const POSTS_PER_PAGE = 6;

export default function Home() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const posts = await getAllPosts();
        setAllPosts(posts);
        setFilteredPosts(posts);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    const filtered = allPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, allPosts]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: document.getElementById('posts')?.offsetTop ? document.getElementById('posts')!.offsetTop - 100 : 0, behavior: 'smooth' });
  };

  return (
    <div>
      <Hero />
      <AboutSection />
      <MissionSection />

      <section id="insights" className={styles.section}>
        <div className={`container`}>
          <div className={styles.sectionHeader}>
            <div className={styles.headingWrapper}>
              <h2 className="heading-lg">Latest Insights</h2>
            </div>

            <div className={styles.searchContainer}>
              <div className={styles.searchInner}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search articles..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading insights...</div>
          ) : filteredPosts.length > 0 ? (
            <>
              <div className={styles.grid}>
                {currentPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noResults}>
              <p>No insights found matching &quot;{searchTerm}&quot;</p>
              <button onClick={() => setSearchTerm('')} className={styles.clearBtn}>Clear Search</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
