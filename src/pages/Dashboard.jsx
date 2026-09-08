import { useState, useRef } from 'react';
import { useLang } from '../hooks/useLang';
import styles from './Dashboard.module.css';

export default function Dashboard({ setPage }) {
  const { t } = useLang();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  const GAMEPLAY_CARDS = [
    {
      img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
      page: 'dashboard',
      label: t.nav.dashboard,
      icon: 'fa-house',
    },
    {
      img: 'https://images.unsplash.com/photo-1691404819847-dab7d769aca7?w=800&q=80',
      page: 'donates',
      label: t.nav.donates,
      icon: 'fa-gem',
    },
    {
      img: 'https://images.unsplash.com/photo-1484069560501-87d72b0c3669?w=800&q=80',
      page: 'faq',
      label: '',
      icon: 'fa-circle-question',
    },
  ];

  const prev = () => setCurrent(c => (c - 1 + GAMEPLAY_CARDS.length) % GAMEPLAY_CARDS.length);
  const next = () => setCurrent(c => (c + 1) % GAMEPLAY_CARDS.length);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

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

      <section className={styles.gameplay}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.decorLine} />
            <h2 className={styles.sectionTitle}>
              <i className="fa-solid fa-gamepad" style={{ marginRight: '13px', color: 'var(--accent)' }}></i>
              {t.gameplay.title}
            </h2>
            <span className={styles.decorLine} />
          </div>

          <div className={styles.sliderWrapper} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <button className={`${styles.sliderArrow} ${styles.arrowLeft}`} onClick={prev}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div className={styles.sliderTrack}>
              {GAMEPLAY_CARDS.map((card, i) => {
                const total = GAMEPLAY_CARDS.length;
                const offset = ((i - current) % total + total) % total;
                let pos = offset > total / 2 ? offset - total : offset;
                const isCenter = pos === 0;
                const isLeft = pos === -1;
                const isRight = pos === 1;
                const isHidden = Math.abs(pos) > 1;

                return (
                  <div
                    key={i}
                    className={`${styles.sliderCard} ${isCenter ? styles.sliderCenter : ''} ${isLeft ? styles.sliderLeft : ''} ${isRight ? styles.sliderRight : ''} ${isHidden ? styles.sliderHidden : ''}`}
                    onClick={() => isCenter ? setPage(card.page) : (pos < 0 ? prev() : next())}
                  >
                    <img src={card.img} alt={card.label || 'FAQ'} />
                    <div className={styles.sliderGlass}>
                      {card.label ? (
                        <span className={styles.sliderLabel}>
                          <i className={`fa-solid ${card.icon}`}></i> {card.label}
                        </span>
                      ) : <span />}
                      {isCenter && (
                        <div className={styles.sliderPlayBtn}>
                          <i className="fa-solid fa-arrow-right"></i>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button className={`${styles.sliderArrow} ${styles.arrowRight}`} onClick={next}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div className={styles.sliderDots}>
            {GAMEPLAY_CARDS.map((_, i) => (
              <button key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`} onClick={() => setCurrent(i)} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
