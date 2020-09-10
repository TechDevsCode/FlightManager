import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { HashLocationStrategy } from '@angular/common';

@Component({
  selector: 'app-airport-map',
  templateUrl: './airport-map.component.html',
  styleUrls: ['./airport-map.component.scss']
})
export class AirportMapComponent implements OnInit, OnChanges {

  map: google.maps.Map;
  marker: google.maps.Marker;

  @Input() mapId: string = "departure-map";
  @Input() position: google.maps.LatLng = new google.maps.LatLng(0, 0);

  options;

  constructor() {
  }

  ngOnInit(): void {
    this.initMap();
  }

  initMap() {
    this.map = new google.maps.Map(document.getElementById(this.mapId), { zoom: 6, center: this.position });
    this.marker = new google.maps.Marker({ position: this.position, map: this.map });
    this.setPosition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.initMap();
    if (this.map) {
      if (changes.position && changes.position.currentValue != changes.position.previousValue) {
        this.setPosition();
      }
    }
  }

  setPosition() {
    if (this.marker) {
      this.marker.setPosition(this.position);
      this.centreMap();
    }
  }

  centreMap() {
    if (this.map) {
      this.map.setCenter(this.position);
    }
  }
}
