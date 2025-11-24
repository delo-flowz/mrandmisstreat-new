import Link from 'next/link';
import styles from './styles/notfound.module.css';

export default function NotFound() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Oops! Page Not Found</h1>
      <p className={styles.subtitle}>The page you are looking for does not exist.</p>
      <Link href="/" className={styles.button}>
        Go to Home
      </Link>
    </main>
  );
}
