import { useLang } from '../hooks/useLang';
import styles from './Footer.module.css';
import logoImg from '../assets/logo.png';

const LANGS = ['RU', 'KZ', 'EN'];

export default function Footer() {
  const { t, lang, setLang } = useLang();
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
          <img src={logoImg} alt="MortyMC" className={styles.logoImg} />
          <span>MortyMC</span>
        </div>
        <p className={styles.copy}>{t.footer.rights}</p>
      </div>
    </footer>
  );
}
