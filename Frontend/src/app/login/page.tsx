import { LoginForm } from '@/components/Auth/LoginForm';
import type { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Login - Platziflix',
  description: 'Login to your Platziflix account',
};

export default function LoginPage() {
  return (
    <div className={styles.authPageContainer}>
      <LoginForm />
    </div>
  );
}
