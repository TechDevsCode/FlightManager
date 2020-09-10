import { SimUpdate } from "./SimUpdate";
export class FlightUpdate {
  time: Date;
  pos: google.maps.LatLng;
  lat: number;
  lng: number;
  alt: number;
  spd: number;
  fuel: number;
  stall: boolean;
  overspeed: boolean;
  grounded: boolean;
  parkingBrake: boolean;
  enginerpm: number;
  constructor(update: SimUpdate) {
    this.time = new Date();
    this.pos = update.position;
    this.alt = update.altitude;
    this.spd = update.groundSpeed;
    this.fuel = update.fuelQty;
    this.stall = update.stallWarning;
    this.overspeed = update.overspeedWarning;
    this.grounded = update.onGround;
    this.parkingBrake = update.parkingBrake;
    this.enginerpm = update.enginerpm;
  }
}
