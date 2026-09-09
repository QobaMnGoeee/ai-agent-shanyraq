import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { useLang } from '../hooks/useLang';
import { useSiteSettings } from '../hooks/useSiteSettings';
import styles from './FAQ.module.css';

export default function FAQ({ goBack }) {
  const { t, lang } = useLang();
  const { serverIp } = useSiteSettings();
  const [requisite, setRequisite] = useState('xxxx xxxx xxxx xxxx');
  const [openIdx, setOpenIdx] = useState(null);
  const [customFaq, setCustomFaq] = useState(null);

  useEffect(() => {
    const r = ref(db, 'settings/requisite');
    const unsub = onValue(r, (snap) => {
      const v = snap.val();
      if (v) setRequisite(v);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const r = ref(db, `settings/faq/${lang}`);
    const unsub = onValue(r, (snap) => {
      const v = snap.val();
      setCustomFaq(Array.isArray(v) ? v : null);
    });
    return () => unsub();
  }, [lang]);

  // Әкімші баптаулардан келген FAQ болса — соны қолданамыз, әйтпесе әдепкі аудармаларды
  const rawFaqs = (customFaq && customFaq.length > 0) ? customFaq : t.faq.items;
  // Мәтіндегі IP-ды ағымдағы сервер мекенжайымен алмастырамыз (әдепкі аудармаларда да,
  // әкімші жазған кастом жауаптарда да {IP} қолдансаңыз болады)
  const faqs = rawFaqs.map(item => ({
    q: item.q.replaceAll('mortymc.altyn.fun', serverIp).replaceAll('{IP}', serverIp),
    a: item.a.replaceAll('mortymc.altyn.fun', serverIp).replaceAll('{IP}', serverIp),
  }));

  const steps = [
    {
      num: '01',
      icon: 'fa-credit-card',
      title: t.faq.step1title,
      desc: t.faq.step1desc,
      extra: (
        <div className={styles.requisiteBox}>
          <span className={styles.requisiteLabel}>{t.faq.requisite}</span>
          <span className={styles.requisiteValue}>
            <i className="fa-solid fa-credit-card" style={{ marginRight: '10px', opacity: 0.6 }}></i>
            {requisite}
          </span>
        </div>
      ),
    },
    {
      num: '02',
      icon: 'fa-paper-plane',
      title: t.faq.step2title,
      desc: t.faq.step2desc,
    },
    {
      num: '03',
      icon: 'fa-clock',
      title: t.faq.step3title,
      desc: t.faq.step3desc,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backBtn} onClick={goBack}>
            <i className="fa-solid fa-arrow-left"></i> {t.faq.backBtn}
          </button>
          <p className="accent-line">
            <i className="fa-solid fa-circle-question"></i> {t.faq.instruction}
          </p>
          <h1 className={styles.title}>{t.faq.title}</h1>
          <p className={styles.subtitle}>{t.faq.subtitle}</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.stepsGrid}>
          {steps.map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNum}>{s.num}</span>
                <div className={styles.stepIcon}>
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
              </div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
              {s.extra}
            </div>
          ))}
        </div>

        <div className={styles.faqList}>
          <h2 className={styles.faqTitle}>
            <i className="fa-solid fa-list-ul" style={{ marginRight: '13px', color: 'var(--accent)' }}></i>
            {t.faq.faqListTitle}
          </h2>
          {faqs.map((item, i) => (
            <div
              key={i}
              className={`${styles.faqItem} ${openIdx === i ? styles.open : ''}`}
            >
              <button
                className={styles.faqQ}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span>{item.q}</span>
                <i className={`fa-solid ${openIdx === i ? 'fa-minus' : 'fa-plus'} ${styles.faqIcon}`}></i>
              </button>
              {openIdx === i && (
                <div className={styles.faqA}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
