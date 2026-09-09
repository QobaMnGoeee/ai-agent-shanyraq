import { useState } from 'react';
import { useLang } from '../hooks/useLang';
import styles from './Header.module.css';
import logoImg from '../assets/logo.png';

export default function Header({ currentPage, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLang();

  const navItems = [
    { key: 'dashboard', label: t.nav.dashboard },
    { key: 'donates', label: t.nav.donates },
    { key: 'faq', label: t.nav.faq },
  ];

  const handleNav = (key) => { setPage(key); setMenuOpen(false); };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo} onClick={() => handleNav('dashboard')}>
          <img src={logoImg} alt="MortyMC" className={styles.logoImg} />
          <span className={styles.logoText}>MortyMC</span>
        </div>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`${styles.navLink} ${currentPage === item.key ? styles.active : ''}`}
              onClick={() => handleNav(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`${styles.bar} ${menuOpen ? styles.bar1Open : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.bar2Open : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.bar3Open : ''}`} />
        </button>
      </div>
    </header>
  );
}
