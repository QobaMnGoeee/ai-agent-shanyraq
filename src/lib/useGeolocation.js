import { useEffect, useRef, useState } from "react";

/**
 * Пайдаланушының GPS позициясын үздіксіз бақылайды.
 * - accuracy 50м-ден нашар болса — қабылданбайды
 * - жылдамдық км/сағ түрінде де қайтарылады (UI-де көрсету үшін)
 *
 * Қайтарады: { position, error, accuracy, speedKmh }
 * position = { lat, lng } | null
 * speedKmh = number | null
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [speedKmh, setSpeedKmh] = useState(null);
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

        setError(null);
        setAccuracy(acc);
        setSpeedKmh(speed != null ? speed * 3.6 : null);
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

  return { position, accuracy, speedKmh, error };
}
