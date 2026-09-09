import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

const DEFAULTS = {
  siteName: 'MortyMC',
  serverIp: 'mortymc.altyn.fun',
};

// Кэштелген соңғы мән — беттер арасында бірден дұрыс мән көрсету үшін
// (Firebase жауап бергенше "жыпылықтамау" үшін)
let cache = null;

export function useSiteSettings() {
  const [settings, setSettings] = useState(cache || DEFAULTS);

  useEffect(() => {
    const unsub = onValue(ref(db, 'settings/site'), (snap) => {
      const v = snap.val();
      const merged = { ...DEFAULTS, ...(v || {}) };
      cache = merged;
      setSettings(merged);
    });
    return () => unsub();
  }, []);

  return settings;
}

export const SITE_SETTINGS_DEFAULTS = DEFAULTS;
