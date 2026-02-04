'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import styles from './page.module.css';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { requestPasswordReset } from '@/lib/users';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push('/admin');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }

        setResetLoading(true);
        setError('');
        setResetMessage('');

        try {
            await requestPasswordReset(email);
            setResetMessage('Password reset link sent! Check your inbox.');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to send reset email.');
        } finally {
            setResetLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/admin');
        } catch (err: unknown) {
            console.error(err);
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div>
                    <h1 className={`heading-md ${styles.title}`}>Admin Login</h1>
                    <p className={styles.subtitle}>Enter credentials to access dashboard</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {resetMessage && <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '0.85rem' }}>{resetMessage}</div>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label htmlFor="password" className={styles.label} style={{ marginBottom: 0 }}>Password</label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={resetLoading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {resetLoading ? 'Sending...' : 'Forgot Password?'}
                            </button>
                        </div>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${styles.input} ${styles.passwordInput}`}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className={styles.visibilityToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.button}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginTop: '0.5rem' }}>
                        Don&apos;t have an account? <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register now</Link>
                    </p>

                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                </form>
            </div>
        </div>
    );
}
