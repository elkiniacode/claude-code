import { RegisterForm } from '@/components/Auth/RegisterForm';
import type { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Register - Platziflix',
  description: 'Create a new Platziflix account',
};

export default function RegisterPage() {
  return (
    <div className={styles.authPageContainer}>
      <RegisterForm />
    </div>
  );
}
