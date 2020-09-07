import { Component, OnInit } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { HttpClient } from '@angular/common/http';
declare var google: any;

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
}

@Component({
  selector: 'app-sim-connecter',
  templateUrl: './sim-connecter.component.html',
  styleUrls: ['./sim-connecter.component.scss']
})
export class SimConnecterComponent implements OnInit {

  connection: signalR.HubConnection;
  simData: SimUpdate;

  options: any;
  overlays: any[];
  lat = 0;
  lng = 0;
  map: any;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // this.options = {
    //   center: { lat: 36.890257, lng: 30.707417 },
    //   zoom: 12
    // };

    this.overlays = [
      new google.maps.Marker({ position: { lat: 36.879466, lng: 30.667648 }, title: "Konyaalti" }),
      new google.maps.Marker({ position: { lat: 36.883707, lng: 30.689216 }, title: "Ataturk Park" }),
      new google.maps.Marker({ position: { lat: 36.885233, lng: 30.702323 }, title: "Oldtown" }),
      new google.maps.Polygon({
        paths: [
          { lat: 36.9177, lng: 30.7854 }, { lat: 36.8851, lng: 30.7802 }, { lat: 36.8829, lng: 30.8111 }, { lat: 36.9177, lng: 30.8159 }
        ], strokeOpacity: 0.5, strokeWeight: 1, fillColor: '#1976D2', fillOpacity: 0.35
      }),
      new google.maps.Circle({ center: { lat: 36.90707, lng: 30.56533 }, fillColor: '#1976D2', fillOpacity: 0.35, strokeWeight: 1, radius: 1500 }),
      new google.maps.Polyline({ path: [{ lat: 36.86149, lng: 30.63743 }, { lat: 36.86341, lng: 30.72463 }], geodesic: true, strokeColor: '#FF0000', strokeOpacity: 0.5, strokeWeight: 2 })
    ];

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("/simhub")
      .build();

    this.connection
      .start()
      .then(() => {
        console.log("Connection started");
        this.connection.on("PositionObject", (data) => {
          // console.log(data);
          this.processUpdate(JSON.parse(data));
        })
      })
      .catch(err => console.log("Error while starting connection: " + err));
  }

  setMap(event) {
    this.map = event.map;
  }

  async requestInitPlugin() {
    const result = await this.http.post<boolean>("/initPlugin", null).toPromise();
  }

  processUpdate(data: SimUpdate) {
    // console.log(this.simData);
    this.simData = data;
    this.lat = this.simData.Latitude;
    this.lat = this.simData.Longitude;
    this.options = {
      center: { lat: this.lat, lng: this.lng },
      zoom: 12
    };
  }
}
