import { FlightUpdate } from './FlightUpdate';
import { Airport } from "./Airport";
export class Flight {
  flightId: string;
  name: string;
  departure: Airport;
  arrival: Airport;
  cargoWeight: number;
  pax: number;
  departureTime: Date;
  takeoffTime: Date;
  landTime: Date;
  arrivalTime: Date;
  flightData: FlightUpdate[];
  status: string;
  flightStatus: string;
  flightNumber: string;
  tailNumber: string;
  pilot: string;
  constructor(flightId: string, name: string) {
    this.flightId = flightId;
    this.name = name;
    this.status = "Not Started";
    this.flightStatus = "Parked";
    this.flightData = [];
  }
}
