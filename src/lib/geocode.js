/**
 * OpenStreetMap Nominatim арқылы қала/орын іздеу.
 * Тегін, API кілт қажет емес, бірақ rate limit бар (1 сұрау/секунд).
 */
export async function searchPlace(query) {
  if (!query || query.trim().length < 2) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query.trim());
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url, {
    headers: {
      "Accept-Language": "ru",
    },
  });

  if (!res.ok) throw new Error("Ошибка поиска");

  const data = await res.json();
  return data.map((item) => ({
    id: item.place_id,
    name: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
