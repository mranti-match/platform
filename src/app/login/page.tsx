'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, googleProvider } from '@/lib/firebase';
import styles from './page.module.css';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { requestPasswordReset, getUserByUid, createAppUser } from '@/lib/users';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.emailVerified) {
                router.push('/admin');
            }
        });

        // Force body background to match dark theme to avoid white margins during scroll
        document.body.style.backgroundColor = '#09090b';

        return () => {
            unsubscribe();
            document.body.style.backgroundColor = '';
        };
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            if (!userCredential.user.emailVerified) {
                await signOut(auth);
                setError('Please verify your email address before logging in. Check your inbox for the verification link.');
                return;
            }

            router.push('/admin');
        } catch (err: any) {
            console.error(err);
            setError(err.code === 'auth/invalid-credential' ? 'Invalid email or password.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            if (!user.emailVerified) {
                await signOut(auth);
                setError('Your Google account email is not verified. Please verify it through Google first.');
                return;
            }

            // Check if user exists in database
            const existingUser = await getUserByUid(user.uid);

            if (!existingUser) {
                // Create profile for new Google user (allowing login to act as signup)
                const displayName = user.displayName || user.email?.split('@')[0] || 'Google User';
                await createAppUser({
                    uid: user.uid,
                    email: user.email || '',
                    displayName: displayName,
                    fullName: displayName,
                    role: 'User',
                    organization: 'Google Stakeholder',
                    active: true
                });
            }

            router.push('/admin');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to sign in with Google.');
        } finally {
            setGoogleLoading(false);
        }
    };




    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Enter credentials to access Match</p>
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

                    <div className={styles.divider}>or</div>

                    <button
                        type="button"
                        className={styles.googleButton}
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                    >
                        <svg className={styles.googleIcon} viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        {googleLoading ? 'Connecting...' : 'Continue with Google'}
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
