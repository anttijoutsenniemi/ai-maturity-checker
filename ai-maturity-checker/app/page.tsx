import Link from "next/link";
import styles from '@/styles/HomePage.module.css';

export default function FrontPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome to My App</h1>
        <div className={styles.links}>
          <Link href="/signin" className={styles.link}>
            Sign In
          </Link>
          <Link href="/signup" className={styles.link}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
