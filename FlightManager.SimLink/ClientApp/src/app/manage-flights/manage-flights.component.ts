import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SelectItem } from 'primeng/api';
import { FlightService as FlightService } from '../flight.service';
import { Router } from '@angular/router';
import { Flight } from '../models/Flight';
import { Airport } from '../models/Airport';

@Component({
  selector: 'app-manage-flights',
  templateUrl: './manage-flights.component.html',
  styleUrls: ['./manage-flights.component.scss']
})
export class ManageFlightsComponent implements OnInit {

  savedFlights: Flight[];

  constructor(
    private http: HttpClient,
    private flightService: FlightService,
    private router: Router
  ) { }

  async ngOnInit() {
    // await this.loadAiports();
    this.loadJobs();
    // console.log(this.savedFlights);
    // this.flight.flightNumber = "TDEV024";
    // this.flight.tailNumber = "G-TDV";
    // this.flight.pilot = "Steve Kent";
  }

  async loadJobs() {
    this.savedFlights = this.flightService.listFlight();
  }


  deleteJob(job: Flight) {
    this.flightService.deleteFlight(job.flightId);
    this.savedFlights = this.flightService.listFlight();
  }

  startSavedJob(job: Flight) {
    this.flightService.loadFlight(job.flightId);
    this.router.navigate(['/flights', job.flightId]);
  }

  downloadJobFile(job: Flight) {
    this.downloadJson(job, job.flightId + ' - ' + job.departure.icao + ' to ' + job.arrival.icao);
  }

  downloadJson(myJson, name) {
    var sJson = JSON.stringify(myJson);
    var element = document.createElement('a');
    element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(sJson));
    element.setAttribute('download', name + ".json");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click(); // simulate click
    document.body.removeChild(element);
  }

  async uploadFile(event) {
    const files: FileList = event.files;
    const f: File = event.files[0];
    const text = await f.text();
    const j: Flight = JSON.parse(text);
    this.flightService.createFlight(j);
    this.loadJobs();
  }
}
