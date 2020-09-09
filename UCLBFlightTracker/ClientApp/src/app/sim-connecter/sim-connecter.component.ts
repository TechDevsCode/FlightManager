import { Component, OnInit } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { HttpClient } from '@angular/common/http';
declare var google: any;
import { } from 'googlemaps';
import { JobService } from '../job.service';
import { FlightUpdate } from '../manage-jobs/manage-jobs.component';

export interface SimUpdate {
  Latitude: number;
  Longitude: number;
  Altitude: number;
  GroundTrack: number;
  GroundSpeed: number;
  ParkingBrake: boolean;
  OnGround: boolean;
  TrueHeading: number;
  TailNumber: string;
  Airline: string;
  FlightNumber: string;
  Model: string;
  StallWarning: boolean;
  OverspeedWarning: boolean;
  FuelQty: number;
  GPSApproachTimeDeviation: boolean;
  AtDepartureAirport: boolean;
  AtArrivalAirport: boolean;
  DistanceToDestination: number;
}

@Component({
  selector: 'app-sim-connecter',
  templateUrl: './sim-connecter.component.html',
  styleUrls: ['./sim-connecter.component.scss']
})
export class SimConnecterComponent implements OnInit {

  connection: signalR.HubConnection;
  simData: SimUpdate;

  follow: boolean = false;

  options: any;
  overlays: any[];
  lat = 0;
  lng = 0;

  map: google.maps.Map;
  marker: google.maps.Marker;

  numDeltas = 100;
  delay = 10; //milliseconds
  i = 0;
  deltaLat;
  deltaLng;
  position = [40.748774, -73.985763];

  private lastUpdate: number = new Date().getTime();
  private frequency: number = 1000;

  constructor(
    private http: HttpClient,
    public jobService: JobService
  ) { }

  ngOnInit(): void {
    // this.requestInitPlugin();
    if (this.jobService.lastFlightUpdate) {
      this.options = {
        center: { lat: this.jobService.lastFlightUpdate.lat, lng: this.jobService.lastFlightUpdate.lng },
        zoom: 10,
        mapTypeId: 'terrain'
      };
    } else {
      this.options = {
        center: { lat: 0, lng: 0 },
        zoom: 10,
        mapTypeId: 'terrain'
      };
    };

    this.simData = <SimUpdate>{};
    this.simData.Latitude = this.jobService.activeJob.departure.latitude;
    this.simData.Longitude = this.jobService.activeJob.departure.longitude;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("/simhub")
      .build();

    this.connection
      .start()
      .then(() => {
        console.log("Connection started");
        this.connection.on("PositionObject", (data) => {
          const current = new Date().toTimeString();
          const next = new Date(this.lastUpdate + this.frequency).toTimeString();
          // console.log({ current, next });
          if (current >= next) {
            this.processUpdate(JSON.parse(data));
          }
        })
      })
      .catch(err => console.log("Error while starting connection: " + err));

  }

  get planeMarkerIcon() {
    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: "#f700d4",
      fillOpacity: 1,
      strokeWeight: 4,
      scale: 7,
      rotation: this.simData.TrueHeading
    }
  };

  setMap(event) {
    this.map = event.map;
    this.marker = new google.maps.Marker({ position: { lat: this.simData.Latitude, lng: this.simData.Longitude }, map: this.map, icon: this.planeMarkerIcon });
    this.centrMapOnPosition();
  }

  async requestInitPlugin() {
    const result = await this.http.post<boolean>("/initPlugin", null).toPromise();
    this.centrMapOnPosition();
  }

  processUpdate(data: SimUpdate) {
    this.lastUpdate = new Date().getTime();
    const currentPos = { lat: data.Latitude, lng: data.Longitude };
    data.AtDepartureAirport = this.atDepartureAirport(currentPos);
    data.AtArrivalAirport = this.atArrivalAirport(currentPos);
    data.DistanceToDestination = this.distanceToDestination(currentPos);
    this.simData = data;
    if (this.jobService.activeJob && this.jobService.activeJob.status == "Started") {
      this.jobService.update(new FlightUpdate(data));
      this.drawFlightPath();
      this.drawJobPins();
    }
    this.position = [this.simData.Latitude, this.simData.Longitude];
    this.setMarker();
  }

  centrMapOnPosition() {
    if (this.simData && this.map) {
      this.map.setCenter({ lat: this.simData.Latitude, lng: this.simData.Longitude });
    }
  }

  setMarker() {
    if (this.map) {
      if (this.follow) {
        this.centrMapOnPosition();
      }
      const result = (this.setMarker) ? [this.simData.Latitude, this.simData.Longitude] : [this.jobService.activeJob.departure.latitude, this.jobService.activeJob.departure.longitude];
      this.i = 0;
      this.deltaLat = (result[0] - this.position[0]) / this.numDeltas;
      this.deltaLng = (result[1] - this.position[1]) / this.numDeltas;

      var latlng = new google.maps.LatLng(this.position[0], this.position[1]);
      this.marker.setPosition(latlng);
      this.marker.setIcon(this.planeMarkerIcon);
      if (this.i != this.numDeltas) {
        this.i++;
        setTimeout(this.setMarker, this.delay);
      }
    }
  }

  drawFlightPath() {
    if (this.jobService.activeJob && this.jobService.activeJob.flightData.length > 0) {
      const points = this.jobService.activeJob.flightData.map(x => new google.maps.LatLng(x.lat, x.lng));
      const lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 4
      };
      var line = new google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: this.map
      });
    }
  }

  drawJobPins() {
    if (this.jobService.activeJob) {
      const depLatLng = { lat: this.jobService.activeJob.departure.latitude, lng: this.jobService.activeJob.departure.longitude }
      const destLatLng = { lat: this.jobService.activeJob.arrival.latitude, lng: this.jobService.activeJob.arrival.longitude };
      var depMarker = new google.maps.Marker({
        position: depLatLng,
        map: this.map,
        title: this.jobService.activeJob.departure.icao + ' - ' + this.jobService.activeJob.departure.name,
        label: this.jobService.activeJob.departure.icao
      });

      var destMarker = new google.maps.Marker({
        position: destLatLng,
        map: this.map,
        title: this.jobService.activeJob.arrival.icao + ' - ' + this.jobService.activeJob.arrival.name,
        label: this.jobService.activeJob.arrival.icao
      });

      var line = new google.maps.Polyline({
        path: [depLatLng, destLatLng],
        geodesic: true,
        strokeColor: '#4eff33',
        strokeOpacity: .80,
        strokeWeight: 4,
        map: this.map
      });

      // var line = new google.map.PolyLine({
      //   path: [depLatLng, destLatLng],
      //   geodesic: true,
      //   strokeColor: "#4eff33",
      //   strokeOpacity: 1,
      //   strokeWeight: 3,
      //   map: this.map
      // });
    }
  }

  atDepartureAirport(currentPos) {
    const departurePos = { lat: this.jobService.activeJob.departure.latitude, lng: this.jobService.activeJob.departure.longitude };
    const distanceFromAirport = this.jobService.measureDistance(currentPos, departurePos);
    return (distanceFromAirport <= 2000 && this.simData.OnGround);
  }

  atArrivalAirport(currentPos) {
    const arrivalPos = { lat: this.jobService.activeJob.arrival.latitude, lng: this.jobService.activeJob.arrival.longitude };
    const distanceFromAirport = this.jobService.measureDistance(currentPos, arrivalPos);
    return (distanceFromAirport <= 2000 && this.simData.OnGround);
  }

  distanceToDestination(currentPos): number {
    const arrivalPos = { lat: this.jobService.activeJob.arrival.latitude, lng: this.jobService.activeJob.arrival.longitude };
    return Math.round(this.jobService.measureDistance(currentPos, arrivalPos) / 1000);
  }
}
