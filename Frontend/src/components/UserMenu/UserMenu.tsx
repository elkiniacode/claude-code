'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './UserMenu.module.scss';

export function UserMenu() {
  const { user, state, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (state === 'loading') {
    return <div className={styles.userMenu}>Loading...</div>;
  }

  if (state === 'unauthenticated') {
    return (
      <div className={styles.userMenu}>
        <Link href="/login" className={styles.link}>
          Login
        </Link>
        <Link href="/register" className={styles.link}>
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.userMenu}>
      <span className={styles.userName}>{user?.full_name}</span>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
}
