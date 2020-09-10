export class Airport {
  airportId: number;
  name: string;
  city: string;
  country: string;
  iata: string;
  icao: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timezone: string;
  dst: string;
  tz: string;
  type: string;
  source: string;
  distanceFrom: number;
  position: google.maps.LatLngLiteral;
}
