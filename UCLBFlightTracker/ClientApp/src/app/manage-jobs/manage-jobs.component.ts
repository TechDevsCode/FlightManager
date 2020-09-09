import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SelectItem } from 'primeng/api';
import { SimUpdate } from '../sim-connecter/sim-connecter.component';
import { JobService } from '../job.service';
import { Router } from '@angular/router';

export class Airport {
  airportId: number;
  name: string;
  city: string;
  country: string;
  iata: string;
  icao: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timezone: string;
  dst: string;
  tz: string;
  type: string;
  source: string;
  distanceFrom: number;
}

export class Job {
  jobNumber: string;
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

  constructor(jobNumber: string, name: string) {
    this.jobNumber = jobNumber;
    this.name = name;
    this.status = "Not Started";
    this.flightStatus = "Parked";
    this.flightData = [];
  }
}

export class FlightUpdate {
  time: Date;
  lat: number;
  lng: number;
  alt: number;
  spd: number;
  fuel: number;
  stall: boolean;
  overspeed: boolean;
  grounded: boolean;

  constructor(update: SimUpdate) {
    this.time = new Date();
    this.lat = update.Latitude;
    this.lng = update.Longitude;
    this.alt = update.Altitude;
    this.spd = update.GroundSpeed;
    this.fuel = update.FuelQty;
    this.stall = update.StallWarning;
    this.overspeed = update.OverspeedWarning;
    this.grounded = update.OnGround;
  }
}

@Component({
  selector: 'app-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.scss']
})
export class ManageJobsComponent implements OnInit {

  airportOptions: SelectItem[];
  job: Job = new Job(this.getRandomInt(10000, 99999).toString(), "Freight Job");

  savedJobs: Job[];

  constructor(
    private http: HttpClient,
    private jobService: JobService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.loadAiports();
    this.savedJobs = this.jobService.listJobs();
    console.log(this.savedJobs);
    this.job.flightNumber = "TDEV024";
    this.job.tailNumber = "G-TDV";
    this.job.pilot = "Steve Kent";
  }

  async loadAiports() {
    const airports = await this.http.get<Airport[]>("airports").toPromise()
    this.airportOptions = airports.map(x => <SelectItem>{ label: `${x.icao} - ${x.name}`, value: x });
  }

  private getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

  startJob() {
    this.jobService.createJob(this.job);
    this.router.navigate(['/sim_connect']);
  }

  deleteJob(job: Job) {
    this.jobService.deleteJob(job.jobNumber);
    this.savedJobs = this.jobService.listJobs();
  }

  startSavedJob(job: Job) {
    this.jobService.loadJob(job.jobNumber);
    this.router.navigate(['/sim_connect']);
  }

  downloadJobFile(job: Job) {
    this.downloadJson(job, job.jobNumber + ' - ' + job.departure.icao + ' to ' + job.arrival.icao);
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
}
