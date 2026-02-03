'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './RegisterForm.module.scss';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, state } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Client-side validation
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (fullName.trim().length < 2) {
      setLocalError('Full name must be at least 2 characters');
      return;
    }

    try {
      await register({ email, password, full_name: fullName });
      router.push('/'); // Redirect to home after registration
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('Registration failed. Please try again.');
      }
    }
  };

  const isLoading = state === 'loading';

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Register for Platziflix</h2>

      {localError && (
        <div className={styles.error} role="alert">
          {localError}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="name"
          minLength={2}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="new-password"
          minLength={6}
        />
        <span className={styles.fieldHint}>Minimum 6 characters</span>
      </div>

      <button type="submit" disabled={isLoading} className={styles.submitButton}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>

      <p className={styles.switchForm}>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </form>
  );
}
