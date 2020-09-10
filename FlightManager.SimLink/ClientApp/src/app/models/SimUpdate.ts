export interface SimUpdate {
  latitude: number;
  longitude: number;
  altitude: number;
  groundTrack: number;
  groundSpeed: number;
  parkingBrake: boolean;
  onGround: boolean;
  trueHeading: number;
  tailNumber: string;
  airline: string;
  flightNumber: string;
  model: string;
  stallWarning: boolean;
  overspeedWarning: boolean;
  fuelQty: number;
  gpsApproachTimeDeviation: boolean;
  atDepartureAirport: boolean;
  atArrivalAirport: boolean;
  distanceToDestination: number;
  position: google.maps.LatLng;
  enginerpm: number;
}
