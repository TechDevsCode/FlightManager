import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { HashLocationStrategy } from '@angular/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnChanges {

  map: google.maps.Map;
  marker: google.maps.Marker;
  depMarker: google.maps.Marker;
  arvMarker: google.maps.Marker;
  flightPathLine: google.maps.Polyline;

  follow: boolean = true;
  trackHeading: boolean;

  @Input() position: google.maps.LatLng;
  @Input() heading: number;

  @Input() departure: google.maps.LatLng;
  @Input() arrival: google.maps.LatLng;

  @Input() flightPath: google.maps.LatLng[];

  options;

  constructor() {
  }

  ngOnInit(): void {
    this.map = new google.maps.Map(document.getElementById("fm-map"), { zoom: 6, center: this.position });
    this.marker = new google.maps.Marker({ icon: this.planeMarkerIcon, map: this.map });
    this.depMarker = new google.maps.Marker({ title: "From", map: this.map });
    this.arvMarker = new google.maps.Marker({ title: "To", map: this.map });
    this.flightPathLine = new google.maps.Polyline({
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: this.map
    });
    this.setPosition();
    this.setHeading();
    this.setDeparture();
    this.setArrival();
    this.setFlightPath();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      if (changes.position && changes.position.currentValue != changes.position.previousValue) {
        this.setPosition();
      }

      if (changes.heading) {
        this.setHeading();
      }

      if (changes.departure && changes.departure.currentValue != changes.departure.previousValue) {
        this.setDeparture();
      }

      if (changes.arrival && changes.arrival.currentValue != changes.arrival.previousValue) {
        this.setArrival();
      }

      if (changes.flightPath) {
        this.setFlightPath();
      }
    }
  }

  get planeMarkerIcon() {
    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: "#f700d4",
      fillOpacity: 1,
      strokeWeight: 3,
      scale: 5,
      rotation: (this.trackHeading) ? 0 : this.heading
    }
  };

  setPosition() {
    if (this.marker) {
      this.marker.setPosition(this.position);
      if (this.follow) this.centreMap();
    }
  }

  setHeading() {
    if (this.marker) {
      this.marker.setIcon(this.planeMarkerIcon);
      this.map.setHeading((this.trackHeading) ? this.heading : 0);
    }
  }

  setDeparture() {
    if (this.depMarker) {
      this.depMarker.setPosition(this.departure);
    } else {
      console.error("Cannot set departure marker because it was null");
    }
  }

  setArrival() {
    if (this.arvMarker) {
      this.arvMarker.setPosition(this.arrival);
    }
  }

  setFlightPath() {
    if (this.flightPathLine) {
      this.flightPathLine.setPath(this.flightPath);
    }
  }

  centreMap() {
    if (this.map) {
      this.map.setCenter(this.position);
    }
  }
}
