import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, onValue } from 'firebase/database';
import { useLang } from '../hooks/useLang';
import styles from './Donates.module.css';

export default function Donates({ goBack }) {
  const { t } = useLang();
  const [donates, setDonates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [nick, setNick] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsub = onValue(ref(db, 'donates'), (snap) => {
      const data = snap.val();
      const ls = localStorage.getItem('localDonates');
      const local = ls ? JSON.parse(ls) : [];
      const remote = data ? Object.entries(data).map(([id, v]) => ({ id, ...v })) : [];
      setDonates([...local, ...remote]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openModal = (d) => { setSelected(d); setStatus(''); setNick(''); setPhone(''); setFile(null); };
  const closeModal = () => { setSelected(null); setStatus(''); };

  const fileToBase64 = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const handleSubmit = async () => {
    if (!nick || !phone) return;
    setSending(true);
    try {
      let fileData = null;
      if (file) fileData = await fileToBase64(file);
      await push(ref(db, 'Orders'), {
        nick, phone,
        donate: selected?.name,
        price: selected?.price,
        file: fileData ? fileData.substring(0, 500) : null,
        timestamp: Date.now(),
      });
      setStatus('success');
    } catch { setStatus('error'); }
    setSending(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backBtn} onClick={goBack}>
            <i className="fa-solid fa-arrow-left"></i> {t.donates.backBtn}
          </button>
          <p className="accent-line"><i className="fa-solid fa-gem"></i> {t.donates.subtitle}</p>
          <h1 className={styles.title}>{t.donates.title}</h1>
        </div>
      </div>

      <div className={`${styles.grid} container`}>
        {loading && (
          <div className={styles.empty}>
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
        )}
        {!loading && donates.length === 0 && (
          <div className={styles.empty}>
            <i className="fa-solid fa-box-open"></i>
            <p>{t.donates.empty}</p>
          </div>
        )}
        {donates.map((d) => (
          <div key={d.id} className={styles.card}>
            <div className={styles.cardImg}>
              {d.image && <img src={d.image} alt={d.name} />}
              <div className={styles.cardImgOverlay} style={{ '--c': d.color || 'var(--accent)' }} />
              <div className={styles.cardBadge} style={{ color: d.color || 'var(--accent)' }}>
                <i className={`fa-solid ${d.icon || 'fa-star'}`}></i>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTop}>
                <h3 className={styles.cardName} style={{ color: d.color || 'var(--accent)' }}>{d.name}</h3>
                <span className={styles.cardPrice}>₸{d.price}</span>
              </div>
              <p className={styles.cardDesc}>{d.desc}</p>
              <button className={styles.orderBtn} onClick={() => openModal(d)}>
                <i className="fa-solid fa-cart-shopping"></i> {t.donates.order}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h2 className={styles.modalTitle}>{t.donates.modal.title}</h2>
            <p className={styles.modalSub}><i className="fa-solid fa-tag"></i> {selected.name} — ₸{selected.price}</p>

            {status === 'success' ? (
              <div className={styles.successMsg}>
                <i className="fa-solid fa-circle-check"></i> {t.donates.modal.success}
              </div>
            ) : (
              <>
                <div className={styles.field}>
                  <label className={styles.label}><i className="fa-solid fa-user"></i> {t.donates.modal.nick}</label>
                  <input className={styles.input} value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Steve123" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}><i className="fa-solid fa-phone"></i> {t.donates.modal.phone}</label>
                  <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 700 000 0000" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}><i className="fa-solid fa-file-image"></i> {t.donates.modal.file}</label>
                  <label className={styles.fileLabel}>
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
                    <span className={styles.fileBtn}>
                      <i className="fa-solid fa-upload"></i>
                      {file ? file.name : t.donates.modal.fileBtn}
                    </span>
                  </label>
                </div>
                {status === 'error' && <p className={styles.errMsg}><i className="fa-solid fa-triangle-exclamation"></i> {t.donates.modal.error}</p>}
                <button className={styles.submitBtn} onClick={handleSubmit} disabled={sending || !nick || !phone}>
                  {sending ? <><i className="fa-solid fa-spinner fa-spin"></i> {t.donates.sending}</> : <><i className="fa-solid fa-paper-plane"></i> {t.donates.modal.submit}</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
