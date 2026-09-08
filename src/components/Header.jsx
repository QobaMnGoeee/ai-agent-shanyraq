import { useState } from 'react';
import { useLang } from '../hooks/useLang';
import styles from './Header.module.css';

export default function Header({ currentPage, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
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
          {!logoError ? (
            <img
              src="https://cdn.discordapp.com/attachments/1544381975765196870/1546520887098871849/pack.png?ex=6aa01550&is=6a9ec3d0&hm=f080bca985b74a747a7b22c47e964771671447d4b99d5b63fa68781fc97d7df0&"
              alt="MortyMC"
              className={styles.logoImg}
              onError={() => setLogoError(true)}
            />
          ) : (
            <i className="fa-solid fa-cubes" style={{ color: 'var(--accent)', fontSize: '1.5rem' }}></i>
          )}
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
