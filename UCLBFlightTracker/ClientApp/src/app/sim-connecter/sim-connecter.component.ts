import { Component, OnInit } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { HttpClient } from '@angular/common/http';
declare var google: any;
import { } from 'googlemaps';

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

  map: google.maps.Map;
  marker: google.maps.Marker;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.requestInitPlugin();
    this.options = {
      center: { lat: 36.890257, lng: 30.707417 },
      zoom: 12
    };

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
    this.setMarker();
    this.centrMapOnPosition();
  }

  async requestInitPlugin() {
    const result = await this.http.post<boolean>("/initPlugin", null).toPromise();
    this.simData = (<SimUpdate>{
      Latitude: 53.3355,
      Longitude: -8.9681,
      Altitude: 1995,
      TrueHeading: 323,
      FuelQty: 22.68,
      GroundTrack: 325,
      GroundSpeed: 142,
      ParkingBrake: true,
      OnGround: false,
      Airline: "TDV",
      TailNumber: "G-TDV",
      FlightNumber: "24",
      Model: "T",
      StallWarning: false,
      OverspeedWarning: false,
      GPSApproachTimeDeviation: false
    });
    this.centrMapOnPosition();
  }

  processUpdate(data: SimUpdate) {
    this.simData = data;
  }

  centrMapOnPosition() {
    this.map.setCenter({ lat: this.simData.Latitude, lng: this.simData.Longitude });
  }

  setMarker() {
    this.centrMapOnPosition();
    if (this.marker != null) {
      this.marker.setMap(null);
    }
    const image = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: "#f700d4",
      fillOpacity: 1,
      strokeWeight: 2,
      scale: 7,
      rotation: this.simData.TrueHeading
    };
    this.marker = new google.maps.Marker({ position: { lat: this.simData.Latitude, lng: this.simData.Longitude }, map: this.map, icon: image });
  }

  // setMarker() {
  //   if (!this.marker) {
  //     this.initMarker();
  //   }
  //   this.marker.setPosition({ lat: this.simData.Latitude, lng: this.simData.Longitude });
  // }

  debugMap() {
    // console.log(this.map);
    const ctr = this.map.getCenter();
    const newCtr = { lat: ctr.lat() + 0.05, lng: ctr.lng() + 0.05 };
    this.map.setCenter(newCtr);
  }

  changeMarker() {
    var deg = 270
    const img = document.querySelectorAll("img[src='https://gibsonfiles.blob.core.windows.net/stevetest-filestore/airplane_small.png#marker']");
    img.forEach(x => {
      console.log(x);
      x.setAttribute('class', 'plane-marker');
    });
  }
}



var RotateIcon = function (options) {
  this.options = options || {};
  this.rImg = options.img || new Image();
  this.rImg.src = this.rImg.src || this.options.url || '';
  this.options.width = this.options.width || this.rImg.width || 52;
  this.options.height = this.options.height || this.rImg.height || 60;
  var canvas = document.createElement("canvas");
  canvas.width = this.options.width;
  canvas.height = this.options.height;
  this.context = canvas.getContext("2d");
  this.canvas = canvas;
};
RotateIcon.prototype.makeIcon = function (url) {
  return new RotateIcon({ url: url });
};
RotateIcon.prototype.setRotation = function (options) {
  var canvas = this.context,
    angle = options.deg ? options.deg * Math.PI / 180 :
      options.rad,
    centerX = this.options.width / 2,
    centerY = this.options.height / 2;

  canvas.clearRect(0, 0, this.options.width, this.options.height);
  canvas.save();
  canvas.translate(centerX, centerY);
  canvas.rotate(angle);
  canvas.translate(-centerX, -centerY);
  canvas.drawImage(this.rImg, 0, 0);
  canvas.restore();
  return this;
};
RotateIcon.prototype.getUrl = function () {
  return this.canvas.toDataURL('image/png');
};