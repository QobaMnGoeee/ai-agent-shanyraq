import { useLang } from '../hooks/useLang';
import styles from './Dashboard.module.css';

export default function Dashboard({ setPage }) {
  const { t } = useLang();

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80" alt="hero" className={styles.heroBgImg} />
          <div className={styles.heroBgOverlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <p className={styles.heroEyebrow}>
              <i className="fa-solid fa-signal"></i> {t.hero.eyebrow}
            </p>
            <div className={styles.heroIp}>
              <i className="fa-solid fa-server"></i>
              <span className={styles.heroIpValue}>mortymc.altyn.fun</span>
              <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText('mortymc.altyn.fun')} title={t.hero.copy}>
                <i className="fa-regular fa-copy"></i>
              </button>
            </div>
            <p className={styles.heroDesc}>{t.about.desc}</p>
            <div className={styles.heroBtns}>
              <button className={styles.btnPrimary} onClick={() => setPage('donates')}>
                <i className="fa-solid fa-bolt"></i> {t.hero.join}
              </button>
              <button className={styles.btnOutline} onClick={() => setPage('faq')}>
                <i className="fa-solid fa-circle-info"></i> {t.hero.explore}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
