// src/components/Header.js
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        PintFinder
      </Link>
      <nav className={styles.navLinks}>
        <Link href="/venues">
          Find a Pint
        </Link>
        <Link href="/venues/add">
          Add a Venue
        </Link>
      </nav>
    </header>
  );
}