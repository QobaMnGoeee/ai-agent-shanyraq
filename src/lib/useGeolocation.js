import { useEffect, useRef, useState } from "react";

/**
 * Пайдаланушының GPS позициясын үздіксіз бақылайды.
 * - accuracy 50м-ден нашар болса — қабылданбайды
 * - жылдамдық 5 м/с-тан жоғары болса (көлікпен жүру) — қабылданбайды
 *
 * Қайтарады: { position, error, accuracy }
 * position = { lat, lng } | null
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("GPS_UNSUPPORTED");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (e) => {
        const { latitude, longitude, accuracy: acc, speed } = e.coords;

        if (acc > 50) {
          setError("GPS_WEAK_SIGNAL");
          setAccuracy(acc);
          return;
        }

        if (speed != null && speed > 5) {
          // Көлікпен жүру — жаяу қозғалыс талап етіледі, позицияны жаңартпаймыз
          return;
        }

        setError(null);
        setAccuracy(acc);
        setPosition({ lat: latitude, lng: longitude });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setError("GPS_PERMISSION_DENIED");
        else if (err.code === err.TIMEOUT) setError("GPS_TIMEOUT");
        else setError("GPS_WEAK_SIGNAL");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { position, accuracy, error };
}

export const GRID_SIZE = 27e-5; // ~30 метр

export function snapToGrid(lat, lng) {
  return {
    lat: Math.round(lat / GRID_SIZE) * GRID_SIZE,
    lng: Math.round(lng / GRID_SIZE) * GRID_SIZE,
  };
}
