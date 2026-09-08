import { useLang } from '../hooks/useLang';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div className={styles.logo}>
          <i className="fa-solid fa-cubes" style={{ color: 'var(--accent)' }}></i>
          <span>MortyMC</span>
        </div>
        <p className={styles.copy}>{t.footer.rights}</p>
      </div>
    </footer>
  );
}
