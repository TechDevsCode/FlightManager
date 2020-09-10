import { Injectable } from '@angular/core';
import { Flight } from "./models/Flight";
import { FlightUpdate } from "./models/FlightUpdate";
import { Subject } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class FlightService {


  private _activeFlight: Flight;
  private activeFlightSubject = new Subject<Flight>();
  activeFlight = this.activeFlightSubject.asObservable();

  private lastUpdate: number = new Date().getTime();
  private groundedFrequency: number = 60000;
  private groundedMovingFrequency: number = 5000;
  private flyingFrequency: number = 20000;

  constructor(
    private msgService: MessageService
  ) { }

  createFlight(flight: Flight) {
    this._activeFlight = flight;
    this.localSave();
  }

  updateFlight(update: FlightUpdate) {
    // console.log("Saving flight update");
    if (this._activeFlight) {
      let refreshFreq: number;
      if (update.grounded && update.parkingBrake) {
        refreshFreq = this.groundedFrequency;
      } else if (update.grounded && !update.parkingBrake) {
        refreshFreq = this.groundedMovingFrequency;
      } else if (!update.grounded) {
        refreshFreq = this.flyingFrequency
      } else {
        refreshFreq = this.flyingFrequency;
      }
      const current = new Date().toTimeString();
      const next = new Date(this.lastUpdate + refreshFreq).toTimeString();

      if (current >= next) {
        this.lastUpdate = new Date().getTime();
        console.log("Saving flight update");
        update = this.processFligtData(update);
        this._activeFlight.flightData.push(update);
        this.localSave();
      }
    }
  }

  public get lastFlightUpdate(): FlightUpdate {
    const last = this._activeFlight.flightData[this._activeFlight.flightData.length - 1];
    return last;
  }

  private processFligtData(update: FlightUpdate): FlightUpdate {
    const last = this.lastFlightUpdate;

    // console.log("Process Update", update);
    if (last) {


      const current = update;


      if (last.grounded && current.grounded == false) {
        this.takeOff();
      }

      if (last.grounded == false && current.grounded == true) {
        this.land();
      }

      if (current.grounded && last.spd < 2 && current.spd >= 2) {
        this.startTaxi();
      }

      if (current.parkingBrake == true && current.spd < 2 && current.enginerpm == 0 && this.atDepartureAirport(update.pos, current.grounded)) {
        this.completeFLight();
      }

    }
    return update;
  }

  takeOff() {
    this._activeFlight.takeoffTime = new Date();
    this._activeFlight.flightStatus = "In Flight";
    this.notifySuccess('Flight ' + this._activeFlight.flightId + ' Take Off!', 'Taken off from ' + this._activeFlight.arrival.name + ' at ' + new Date().toLocaleTimeString());
    this.localSave();
  }

  land() {
    this._activeFlight.landTime = new Date();
    this._activeFlight.flightStatus = "Arrival Taxi";
    this.notifySuccess('Flight ' + this._activeFlight.flightId + ' Landed!', 'Landed at ' + this._activeFlight.departure.name + ' at ' + new Date().toLocaleTimeString());
    this.localSave();
  }

  startTaxi() {
    this.notifySuccess('Flight ' + this._activeFlight.flightId + ' Taxi Started!', 'Started taxi at ' + this._activeFlight.arrival.name);
    this._activeFlight.flightStatus = "Departure Taxi";
    this.localSave();
  }

  completeFLight() {
    this.notifySuccess('Flight ' + this._activeFlight.flightId + ' Completed!', 'Arrived into ' + this._activeFlight.arrival.name + ' at ' + new Date().toLocaleTimeString());
    this._activeFlight.flightStatus = "Parked!";
    this._activeFlight.status = "Completed";
    this.localSave();
  }

  notifySuccess(title: string, detail: string) {
    this.msgService.add({ severity: 'success', summary: title, detail: detail, sticky: false });
    console.info(title);
  }

  localSave() {
    localStorage.setItem("Flight#-" + this._activeFlight.flightId.toString(), JSON.stringify(this._activeFlight));
    this.activeFlightSubject.next(this._activeFlight);
  }

  startFlight() {
    if (this._activeFlight) {
      this.notifySuccess('Flight ' + this._activeFlight.flightId + ' Started!', 'Parked at ' + this._activeFlight.arrival.name);
      this._activeFlight.status = "Started";
      this.localSave();
    }
  }

  loadFlight(flightId: string) {
    const flight = localStorage.getItem("Flight#-" + flightId.toString());
    if (flight == null) {
      console.log("Flight not found");
    } else {
      this._activeFlight = JSON.parse(flight);
      localStorage.setItem("CurrentFlight", flightId.toString());
    }
    this.activeFlightSubject.next(this._activeFlight);
  }

  listFlight(): Flight[] {
    let flights = [];
    for (var key in localStorage) {
      if (key.startsWith("Flight#-")) {
        const f: Flight = JSON.parse(localStorage.getItem(key));
        if (f && f.flightId) {
          flights.push(f);
        }
      }
    }
    return flights;
  }

  deleteFlight(flightId: string) {
    localStorage.removeItem("Flight#-" + flightId.toString());
  }

  measureDistance(from, to): number {
    const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
    const toLatLng = new google.maps.LatLng(to.lat, to.lng);
    return Math.round(google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng));
  }

  atDepartureAirport(currentPos, grounded) {
    const distanceFromAirport = this.measureDistance(currentPos, this._activeFlight.departure.position);
    // console.log("Current pos", currentPos);
    // console.log("Departure pos", this._activeFlight.departure.position);
    // console.log("Distance from aitport", distanceFromAirport);
    // console.log("Grounded ", grounded);
    return (distanceFromAirport <= 2000 && grounded);
  }

  atArrivalAirport(currentPos, grounded) {
    const distanceFromAirport = this.measureDistance(currentPos, this._activeFlight.arrival.position);
    return (distanceFromAirport <= 2000 && grounded);
  }

  distanceToDestination(currentPos): number {
    return Math.round(this.measureDistance(currentPos, this._activeFlight.arrival.position) / 1000);
  }
}
