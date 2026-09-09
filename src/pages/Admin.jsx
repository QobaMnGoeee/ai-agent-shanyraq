import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { useLang, translations } from '../hooks/useLang';
import { useSiteSettings, SITE_SETTINGS_DEFAULTS } from '../hooks/useSiteSettings';
import styles from './Admin.module.css';

const FAQ_LANGS = ['RU', 'KZ', 'EN'];

export default function Admin() {
  const { t } = useLang();
  const liveSiteSettings = useSiteSettings();
  const [code, setCode] = useState('');
  const [authed, setAuthed] = useState(() => localStorage.getItem('adminAuthed') === 'true');
  const [authError, setAuthError] = useState(false);
  const [orders, setOrders] = useState([]);
  const [donates, setDonates] = useState([]);
  const [tab, setTab] = useState('orders');
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [reqEdit, setReqEdit] = useState('');
  const [reqSaved, setReqSaved] = useState(false);
  const [newDonate, setNewDonate] = useState({ name: '', price: '', desc: '', image: '' });

  // Сайт баптаулары (атауы + сервер IP)
  const [siteEdit, setSiteEdit] = useState(SITE_SETTINGS_DEFAULTS);
  const [siteSaved, setSiteSaved] = useState(false);

  // FAQ басқару
  const [faqLang, setFaqLang] = useState('RU');
  const [faqItems, setFaqItems] = useState(null); // null = firebase-тен әлі жүктелмеді
  const [faqSaved, setFaqSaved] = useState(false);

  useEffect(() => {
    setSiteEdit(liveSiteSettings);
  }, [liveSiteSettings]);

  useEffect(() => {
    if (!authed) return;
    const unsub = onValue(ref(db, 'Orders'), (snap) => {
      const data = snap.val();
      if (data) setOrders(Object.entries(data).map(([id, v]) => ({ id, ...v })));
      else setOrders([]);
    });
    const unsub2 = onValue(ref(db, 'settings/requisite'), (snap) => {
      const v = snap.val();
      if (v) setReqEdit(v);
    });
    const unsub3 = onValue(ref(db, 'donates'), (snap) => {
      const data = snap.val();
      const ls = localStorage.getItem('localDonates');
      const local = ls ? JSON.parse(ls) : [];
      const remote = data ? Object.entries(data).map(([id, v]) => ({ id, ...v, remote: true })) : [];
      setDonates([...local.map(d => ({ ...d, remote: false })), ...remote]);
    });
    return () => { unsub(); unsub2(); unsub3(); };
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    const r = ref(db, `settings/faq/${faqLang}`);
    const unsub = onValue(r, (snap) => {
      const v = snap.val();
      if (Array.isArray(v) && v.length > 0) {
        setFaqItems(v);
      } else {
        // Firebase-те әлі жоқ болса — сол тілдің дефолт (translations.js) мәтінін көрсетеміз
        const defaults = translations[faqLang]?.faq?.items || [];
        setFaqItems(defaults);
      }
    });
    return () => unsub();
  }, [authed, faqLang]);

  const handleLogin = () => {
    onValue(ref(db, 'admins'), (snap) => {
      const data = snap.val();
      const valid = data
        ? Object.values(data).includes(code)
        : code === 'admin123';
      if (valid) {
        setAuthed(true);
        setAuthError(false);
        localStorage.setItem('adminAuthed', 'true');
      }
      else setAuthError(true);
    }, { onlyOnce: true });
  };

  const handleLogout = () => {
    setAuthed(false);
    localStorage.removeItem('adminAuthed');
  };

  const handleAddDonate = async () => {
    if (!newDonate.name || !newDonate.price) return;
    try {
      await push(ref(db, 'donates'), {
        name: newDonate.name,
        price: newDonate.price,
        desc: newDonate.desc,
        image: newDonate.image,
        color: 'var(--accent)',
        icon: 'fa-star',
      });
    } catch {
      const ls = localStorage.getItem('localDonates');
      const local = ls ? JSON.parse(ls) : [];
      local.push({ ...newDonate, id: 'local_' + Date.now(), color: 'var(--accent)', icon: 'fa-star' });
      localStorage.setItem('localDonates', JSON.stringify(local));
    }
    setNewDonate({ name: '', price: '', desc: '', image: '' });
    setShowDonateForm(false);
  };

  const handleDeleteDonate = async (d) => {
    if (d.remote) {
      await remove(ref(db, `donates/${d.id}`));
    } else {
      const ls = localStorage.getItem('localDonates');
      const local = ls ? JSON.parse(ls) : [];
      const updated = local.filter(x => x.id !== d.id);
      localStorage.setItem('localDonates', JSON.stringify(updated));
      setDonates(prev => prev.filter(x => x.id !== d.id));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewDonate(p => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveRequisite = async () => {
    await set(ref(db, 'settings/requisite'), reqEdit);
    setReqSaved(true);
    setTimeout(() => setReqSaved(false), 2000);
  };

  const handleSaveSite = async () => {
    const name = (siteEdit.siteName || '').trim() || SITE_SETTINGS_DEFAULTS.siteName;
    const ip = (siteEdit.serverIp || '').trim() || SITE_SETTINGS_DEFAULTS.serverIp;
    await set(ref(db, 'settings/site'), { siteName: name, serverIp: ip });
    setSiteEdit({ siteName: name, serverIp: ip });
    setSiteSaved(true);
    setTimeout(() => setSiteSaved(false), 2000);
  };

  const handleFaqItemChange = (idx, field, value) => {
    setFaqItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleAddFaqItem = () => {
    setFaqItems(prev => [...(prev || []), { q: '', a: '' }]);
  };

  const handleDeleteFaqItem = (idx) => {
    setFaqItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveFaq = async () => {
    const cleaned = (faqItems || []).filter(it => it.q.trim() || it.a.trim());
    await set(ref(db, `settings/faq/${faqLang}`), cleaned);
    setFaqItems(cleaned);
    setFaqSaved(true);
    setTimeout(() => setFaqSaved(false), 2000);
  };

  const handleResetFaqToDefault = () => {
    setFaqItems(translations[faqLang]?.faq?.items || []);
  };

  if (!authed) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginBox}>
          <div className={styles.loginIcon}>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h2 className={styles.loginTitle}>{t.admin.title}</h2>
          <input
            className={styles.loginInput}
            type="password"
            placeholder={t.admin.placeholder}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {authError && (
            <p className={styles.loginError}>
              <i className="fa-solid fa-triangle-exclamation"></i> {t.admin.error}
            </p>
          )}
          <button className={styles.loginBtn} onClick={handleLogin}>
            <i className="fa-solid fa-right-to-bracket"></i> {t.admin.submit}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>
          <i className="fa-solid fa-gauge" style={{ marginRight: '13px', color: 'var(--accent)' }}></i>
          Admin Panel
        </h1>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i> {t.admin.logout}
        </button>
      </div>

      <div className={styles.tabs}>
        {[
          { key: 'orders', label: t.admin.orders, icon: 'fa-inbox' },
          { key: 'donates', label: t.admin.donatesTab, icon: 'fa-gem' },
          { key: 'requisite', label: t.admin.editRequisite, icon: 'fa-credit-card' },
          { key: 'site', label: 'Сайт', icon: 'fa-globe' },
          { key: 'faq', label: 'FAQ', icon: 'fa-circle-question' },
        ].map(tab_ => (
          <button
            key={tab_.key}
            className={`${styles.tab} ${tab === tab_.key ? styles.activeTab : ''}`}
            onClick={() => setTab(tab_.key)}
          >
            <i className={`fa-solid ${tab_.icon}`}></i> {tab_.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className={styles.section}>
          {orders.length === 0 ? (
            <p className={styles.empty}>
              <i className="fa-solid fa-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px', opacity: 0.3 }}></i>
              {t.admin.noOrders}
            </p>
          ) : (
            <div className={styles.ordersGrid}>
              {orders.map((o) => (
                <div key={o.id} className={styles.orderCard}>
                  <div className={styles.orderRow}>
                    <span className={styles.orderKey}><i className="fa-solid fa-user"></i></span>
                    <span className={styles.orderVal}>{o.nick}</span>
                  </div>
                  <div className={styles.orderRow}>
                    <span className={styles.orderKey}><i className="fa-solid fa-phone"></i></span>
                    <span className={styles.orderVal}>{o.phone}</span>
                  </div>
                  <div className={styles.orderRow}>
                    <span className={styles.orderKey}><i className="fa-solid fa-gem"></i></span>
                    <span className={styles.orderVal}>{o.donate} — ₸{o.price}</span>
                  </div>
                  <div className={styles.orderRow}>
                    <span className={styles.orderKey}><i className="fa-solid fa-clock"></i></span>
                    <span className={styles.orderVal}>{new Date(o.timestamp).toLocaleString('ru')}</span>
                  </div>
                  {o.file && (
                    <div className={styles.orderRow}>
                      <span className={styles.orderKey}><i className="fa-solid fa-file"></i></span>
                      <a href={o.file} target="_blank" rel="noreferrer" className={styles.orderLink}>
                        {t.admin.viewReceipt}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'donates' && (
        <div className={styles.section}>
          <button className={styles.addBtn} onClick={() => setShowDonateForm(true)}>
            <i className="fa-solid fa-plus"></i> {t.admin.addDonate}
          </button>
          {showDonateForm && (
            <div className={styles.donateForm}>
              <h3 className={styles.formTitle}>{t.admin.donateForm.title}</h3>
              {[
                { key: 'name', label: t.admin.donateForm.name, icon: 'fa-tag' },
                { key: 'price', label: t.admin.donateForm.price, icon: 'fa-money-bill' },
                { key: 'desc', label: t.admin.donateForm.desc, icon: 'fa-align-left' },
              ].map(f => (
                <div key={f.key} className={styles.field}>
                  <label className={styles.label}>
                    <i className={`fa-solid ${f.icon}`}></i> {f.label}
                  </label>
                  <input
                    className={styles.input}
                    value={newDonate[f.key]}
                    onChange={(e) => setNewDonate(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className={styles.field}>
                <label className={styles.label}>
                  <i className="fa-solid fa-image"></i> {t.admin.donateForm.image}
                </label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
              </div>
              <div className={styles.formBtns}>
                <button className={styles.saveBtn} onClick={handleAddDonate}>
                  <i className="fa-solid fa-floppy-disk"></i> {t.admin.donateForm.save}
                </button>
                <button className={styles.cancelBtn} onClick={() => setShowDonateForm(false)}>
                  {t.admin.donateForm.cancel}
                </button>
              </div>
            </div>
          )}

          <div className={styles.donateManageList}>
            {donates.length === 0 ? (
              <p className={styles.empty}>{t.admin.noDonates}</p>
            ) : (
              donates.map((d) => (
                <div key={d.id} className={styles.donateManageCard}>
                  {d.image && <img src={d.image} alt={d.name} className={styles.donateManageImg} />}
                  <div className={styles.donateManageInfo}>
                    <span className={styles.donateManageName}>{d.name}</span>
                    <span className={styles.donateManagePrice}>₸{d.price}</span>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteDonate(d)} title={t.admin.delete}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'requisite' && (
        <div className={styles.section}>
          <div className={styles.reqForm}>
            <label className={styles.label}>
              <i className="fa-solid fa-credit-card"></i> {t.faq.requisite}
            </label>
            <input
              className={styles.input}
              value={reqEdit}
              onChange={(e) => setReqEdit(e.target.value)}
              placeholder="xxxx xxxx xxxx xxxx"
            />
            <button className={styles.saveBtn} onClick={handleSaveRequisite}>
              {reqSaved
                ? <><i className="fa-solid fa-check"></i> {t.admin.saved}</>
                : <><i className="fa-solid fa-floppy-disk"></i> {t.admin.donateForm.save}</>
              }
            </button>
          </div>
        </div>
      )}

      {tab === 'site' && (
        <div className={styles.section}>
          <div className={styles.reqForm}>
            <p className={styles.sectionHint}>
              <i className="fa-solid fa-circle-info"></i> Бұл жерден сайттың атауын (логотип пен тақырыпта көрінеді) және Minecraft серверінің IP мекенжайын өзгертуге болады. Өзгеріс бүкіл сайтта (Header, Footer, Басты бет, FAQ) бірден көрінеді.
            </p>
            <div className={styles.field}>
              <label className={styles.label}>
                <i className="fa-solid fa-signature"></i> Сайт атауы
              </label>
              <input
                className={styles.input}
                value={siteEdit.siteName}
                onChange={(e) => setSiteEdit(p => ({ ...p, siteName: e.target.value }))}
                placeholder="MortyMC"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <i className="fa-solid fa-server"></i> Сервер IP / домені
              </label>
              <input
                className={styles.input}
                value={siteEdit.serverIp}
                onChange={(e) => setSiteEdit(p => ({ ...p, serverIp: e.target.value }))}
                placeholder="play.example.com"
              />
            </div>
            <button className={styles.saveBtn} onClick={handleSaveSite}>
              {siteSaved
                ? <><i className="fa-solid fa-check"></i> {t.admin.saved}</>
                : <><i className="fa-solid fa-floppy-disk"></i> {t.admin.donateForm.save}</>
              }
            </button>
          </div>
        </div>
      )}

      {tab === 'faq' && (
        <div className={styles.section}>
          <p className={styles.sectionHint}>
            <i className="fa-solid fa-circle-info"></i> FAQ сұрақ-жауаптарын әр тіл үшін бөлек өзгертуге болады. Мәтін ішінде сервер мекенжайын жазу үшін <code>{'{IP}'}</code> қолдансаңыз, ол автоматты түрде ағымдағы серверIP-мен алмасады.
          </p>
          <div className={styles.langTabs}>
            {FAQ_LANGS.map(l => (
              <button
                key={l}
                className={`${styles.langTab} ${faqLang === l ? styles.langTabActive : ''}`}
                onClick={() => setFaqLang(l)}
              >
                {l}
              </button>
            ))}
          </div>

          {(faqItems || []).map((item, idx) => (
            <div key={idx} className={styles.faqEditCard}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <i className="fa-solid fa-circle-question"></i> Сұрақ
                </label>
                <input
                  className={styles.input}
                  value={item.q}
                  onChange={(e) => handleFaqItemChange(idx, 'q', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  <i className="fa-solid fa-comment"></i> Жауап
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={item.a}
                  onChange={(e) => handleFaqItemChange(idx, 'a', e.target.value)}
                />
              </div>
              <button className={styles.deleteBtn} onClick={() => handleDeleteFaqItem(idx)} title={t.admin.delete}>
                <i className="fa-solid fa-trash"></i> Өшіру
              </button>
            </div>
          ))}

          <div className={styles.formBtns} style={{ marginTop: '20.8px' }}>
            <button className={styles.addBtn} onClick={handleAddFaqItem} style={{ marginBottom: 0 }}>
              <i className="fa-solid fa-plus"></i> Сұрақ қосу
            </button>
            <button className={styles.cancelBtn} onClick={handleResetFaqToDefault}>
              <i className="fa-solid fa-rotate-left"></i> Әдепкіге қайтару
            </button>
            <button className={styles.saveBtn} onClick={handleSaveFaq}>
              {faqSaved
                ? <><i className="fa-solid fa-check"></i> {t.admin.saved}</>
                : <><i className="fa-solid fa-floppy-disk"></i> {t.admin.donateForm.save}</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
