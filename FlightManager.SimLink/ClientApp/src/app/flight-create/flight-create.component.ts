import { Component, OnInit } from '@angular/core';
import { Flight } from '../models/Flight';
import { SelectItem } from 'primeng/api/selectitem';
import { Airport } from '../models/Airport';
import { FlightService } from '../flight.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-flight-create',
  templateUrl: './flight-create.component.html',
  styleUrls: ['./flight-create.component.scss']
})
export class FlightCreateComponent implements OnInit {

  flight: Flight = new Flight(this.getRandomInt(10000, 99999).toString(), "Freight Job");
  airportOptions: SelectItem[];

  departureMap: google.maps.Map;
  arrivalMap: google.maps.Map;

  options: any;

  overlays: any[];

  constructor(
    private flightService: FlightService,
    private router: Router,
    private http: HttpClient
  ) { }

  async ngOnInit() {

    this.options = {
      zoom: 14,
      mapTypeId: 'satellite'
    };

    await this.loadAiports();

    this.flight.flightNumber = "TDEV024";
    this.flight.tailNumber = "G-TDV";
    this.flight.pilot = "Steve Kent";
  }

  setDepartureMap(event) {
    this.departureMap = event.map;
  }

  setArrivalMap(event) {
    this.arrivalMap = event.map;
  }

  updateDeparture() {
    this.departureMap.setCenter(this.flight.departure.position);
  }

  updateArrival() {
    this.arrivalMap.setCenter(this.flight.arrival.position);
  }

  private getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }


  async loadAiports() {
    const airports = (await this.http.get<Airport[]>("airports").toPromise()).map(x => { x.position = { lat: x.latitude, lng: x.longitude }; return x; })
    this.airportOptions = airports.map(x => <SelectItem>{ label: `${x.icao} - ${x.name}`, value: x });
  }

  startJob() {
    this.flightService.createFlight(this.flight);
    this.router.navigate(['/flights', this.flight.flightId]);
  }
}
