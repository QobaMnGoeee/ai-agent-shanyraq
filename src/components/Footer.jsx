import { useLang } from '../hooks/useLang';
import { useSiteSettings } from '../hooks/useSiteSettings';
import styles from './Footer.module.css';
import logoImg from '../assets/logo.png';

const LANGS = ['RU', 'KZ', 'EN'];

export default function Footer() {
  const { t, lang, setLang } = useLang();
  const { siteName } = useSiteSettings();
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div className={styles.langBar}>
          {LANGS.map(l => (
            <button
              key={l}
              className={`${styles.langBtn} ${lang === l ? styles.langBtnActive : ''}`}
              onClick={() => setLang(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className={`${styles.logo} ${styles.logoDesktopOnly}`}>
          <img src={logoImg} alt={siteName} className={styles.logoImg} />
          <span>{siteName}</span>
        </div>
        <p className={styles.copy}>{t.footer.rights.replace('MortyMC', siteName)}</p>
      </div>
    </footer>
  );
}
