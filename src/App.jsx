import { useState, useEffect } from 'react';
import { LangContext, translations } from './hooks/useLang';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Donates from './pages/Donates';
import FAQ from './pages/FAQ';
import Admin from './pages/Admin';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'RU');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) setPage(hash);
    const onHash = () => {
      const h = window.location.hash.replace('#', '') || 'dashboard';
      setPage(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleSetPage = (p) => {
    setPage(p);
    window.location.hash = p;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleSetPage('dashboard');
    }
  };

  const handleSetLang = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const t = translations[lang] || translations.RU;
  const isAdmin = page === 'admin';

  return (
    <LangContext.Provider value={{ t, lang, setLang: handleSetLang }}>
      {!isAdmin && <Header currentPage={page} setPage={handleSetPage} />}
      {page === 'dashboard' && <Dashboard setPage={handleSetPage} />}
      {page === 'donates' && <Donates goBack={goBack} />}
      {page === 'faq' && <FAQ goBack={goBack} />}
      {page === 'admin' && <Admin />}
      {!isAdmin && <Footer />}
    </LangContext.Provider>
  );
}
