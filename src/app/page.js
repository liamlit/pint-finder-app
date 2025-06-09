// src/app/page.js
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        Welcome to PintFinder
      </h1>

      <p className={styles.subtitle}>
        Your ultimate guide to finding the best-priced pints in town. Add prices, find deals, and never overpay for a pint again.
      </p>

      <Link href="/venues" className={styles.ctaButton}>
        Find a Pint Now
      </Link>
    </main>
  );
}