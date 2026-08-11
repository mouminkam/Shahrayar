/**
 * Mock reverse geocoder for the checkout map.
 *
 * PRODUCTION: the checkout page called Nominatim
 * (`https://nominatim.openstreetmap.org/reverse?...`) to turn the pin the user
 * dropped into a street address. That is a free, heavily rate-limited public
 * service (1 request/second, blocks generic User-Agents), which is fine behind
 * a real backend that can cache and throttle, but a bad dependency for a
 * portfolio page that anyone might click through — a rate-limited 429 would
 * show up as "unable to detect address".
 *
 * So the lookup resolves locally instead: the pin is snapped to the nearest of
 * the Sofia districts below and its address is returned in the same shape
 * Nominatim's `address` object has, so the calling code is unchanged.
 */

export interface MockGeocodeAddress {
  road: string;
  neighbourhood: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface MockGeocodeResult {
  display_name: string;
  address: MockGeocodeAddress;
}

interface SofiaDistrict {
  lat: number;
  lng: number;
  road: string;
  neighbourhood: string;
  postcode: string;
}

/** A handful of real Sofia districts, enough that nearby pins read differently. */
const SOFIA_DISTRICTS: SofiaDistrict[] = [
  { lat: 42.6977, lng: 23.3219, road: "bul. Vitosha", neighbourhood: "Sredets", postcode: "1000" },
  { lat: 42.6866, lng: 23.3186, road: "bul. Bulgaria", neighbourhood: "Lozenets", postcode: "1421" },
  { lat: 42.6712, lng: 23.2903, road: "ul. Okolovrasten pat", neighbourhood: "Vitosha", postcode: "1618" },
  { lat: 42.6503, lng: 23.3719, road: "bul. Aleksandar Malinov", neighbourhood: "Mladost", postcode: "1712" },
  { lat: 42.7105, lng: 23.2734, road: "bul. Lyulin", neighbourhood: "Lyulin", postcode: "1324" },
  { lat: 42.7241, lng: 23.3402, road: "bul. Rezbarska", neighbourhood: "Poduyane", postcode: "1517" },
  { lat: 42.7019, lng: 23.3854, road: "bul. Tsarigradsko shose", neighbourhood: "Druzhba", postcode: "1592" },
  { lat: 42.6801, lng: 23.2571, road: "ul. Gorski patnik", neighbourhood: "Ovcha Kupel", postcode: "1618" },
];

/** Squared distance is enough here — we only ever compare, never report it. */
function nearestDistrict(lat: number, lng: number): SofiaDistrict {
  return SOFIA_DISTRICTS.reduce((closest, district) => {
    const d = (district.lat - lat) ** 2 + (district.lng - lng) ** 2;
    const best = (closest.lat - lat) ** 2 + (closest.lng - lng) ** 2;
    return d < best ? district : closest;
  }, SOFIA_DISTRICTS[0]);
}

/**
 * Resolves a dropped pin to an address, mirroring Nominatim's response shape.
 * A street number is derived from the coordinates so that dragging the pin
 * visibly changes the address, the way a real lookup would.
 */
export function mockReverseGeocode(lat: number, lng: number): MockGeocodeResult {
  const district = nearestDistrict(lat, lng);
  const streetNumber = (Math.floor(Math.abs(lat * 10000 + lng * 10000)) % 120) + 1;

  const address: MockGeocodeAddress = {
    road: `${district.road} ${streetNumber}`,
    neighbourhood: district.neighbourhood,
    city: "Sofia",
    state: "Sofia-Grad",
    postcode: district.postcode,
    country: "Bulgaria",
  };

  return {
    display_name: `${address.road}, ${address.neighbourhood}, ${address.city}, ${address.postcode}, ${address.country}`,
    address,
  };
}
