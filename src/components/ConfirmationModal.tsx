'use client';

import React from 'react';
import Modal from './Modal';
import styles from '../app/admin/admin.module.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'info' | 'danger' | 'warning' | 'success';
    loading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    type = 'info',
    loading = false
}: ConfirmationModalProps) {

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    </div>
                );
            case 'warning':
                return (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                );
            case 'success':
                return (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                );
            default:
                return (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                    </div>
                );
        }
    };

    const getConfirmButtonStyle = () => {
        switch (type) {
            case 'danger': return { background: '#ef4444', borderColor: '#ef4444' };
            case 'warning': return { background: '#f59e0b', borderColor: '#f59e0b' };
            case 'success': return { background: '#22c55e', borderColor: '#22c55e' };
            default: return { background: 'var(--primary)', borderColor: 'var(--primary)' };
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            footer={(
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%', paddingBottom: '1rem' }}>
                    <button
                        className={styles.btnSecondary}
                        onClick={onClose}
                        disabled={loading}
                        style={{ minWidth: '100px' }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={styles.btnPrimary}
                        onClick={onConfirm}
                        disabled={loading}
                        style={{ ...getConfirmButtonStyle(), minWidth: '100px' }}
                    >
                        {loading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            )}
        >
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                {getIcon()}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>{title}</h3>
                <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6', margin: 0 }}>
                    {message}
                </p>
            </div>
        </Modal>
    );
}
