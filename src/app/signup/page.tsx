'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, googleProvider } from '@/lib/firebase';
import { createAppUser, getUserByUid } from '@/lib/users';
import styles from '../login/page.module.css';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [organization, setOrganization] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Force body background to match dark theme to avoid white margins during scroll
        document.body.style.backgroundColor = '#09090b';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);


    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        setLoading(true);
        setError('');

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            const user = userCredential.user;

            // 2. Send Verification Email
            await sendEmailVerification(user);

            // 3. Create Profile
            await createAppUser({
                uid: user.uid,
                email: cleanEmail,
                displayName: displayName || cleanEmail.split('@')[0],
                role: 'User',
                organization: organization || 'Individual Stakeholder',
                active: true
            });

            setVerificationSent(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists in database
            const existingUser = await getUserByUid(user.uid);

            if (!existingUser) {
                // Create profile for new Google user
                await createAppUser({
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || user.email?.split('@')[0] || 'Google User',
                    role: 'User',
                    organization: 'Google Stakeholder',
                    active: true
                });
            }

            router.push('/admin');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to sign up with Google.');
        } finally {
            setGoogleLoading(false);
        }
    };


    if (verificationSent) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h1 className="heading-md" style={{ marginBottom: '1rem' }}>Verify your email</h1>
                        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2rem' }}>
                            We&apos;ve sent a verification link to <strong>{email}</strong>. Please check your inbox and follow the instructions to activate your account.
                        </p>
                        <Link href="/login" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <h1 className={styles.title}>Join Match</h1>
                    <p className={styles.subtitle}>Create your stakeholder account</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSignup} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="displayName" className={styles.label}>Full Name</label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className={styles.input}
                                placeholder="Alex J."
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="organization" className={styles.label}>Organization</label>
                            <input
                                id="organization"
                                type="text"
                                value={organization}
                                onChange={(e) => setOrganization(e.target.value)}
                                className={styles.input}
                                placeholder="e.g. UTM"
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="alex@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${styles.input} ${styles.passwordInput}`}
                                placeholder="••••••••"
                                required
                                minLength={6}
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
                        {loading ? 'Creating Account...' : 'Register as Stakeholder'}
                    </button>

                    <div className={styles.divider}>or</div>

                    <button
                        type="button"
                        className={styles.googleButton}
                        onClick={handleGoogleSignup}
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
                        Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login here</Link>
                    </p>

                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                </form >
            </div >
        </div >
    );
}
