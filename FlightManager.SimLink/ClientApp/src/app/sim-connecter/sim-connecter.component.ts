import { Component, OnInit } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { HttpClient } from '@angular/common/http';
declare var google: any;
import { } from 'googlemaps';
import { JobService } from '../job.service';
import { FlightUpdate, Job } from '../manage-jobs/manage-jobs.component';
import { ActivatedRoute, Params } from '@angular/router';

export interface SimUpdate {
  latitude: number;
  longitude: number;
  altitude: number;
  groundTrack: number;
  groundSpeed: number;
  parkingBrake: boolean;
  onGround: boolean;
  trueHeading: number;
  tailNumber: string;
  airline: string;
  flightNumber: string;
  model: string;
  stallWarning: boolean;
  overspeedWarning: boolean;
  fuelQty: number;
  gpsApproachTimeDeviation: boolean;
  atDepartureAirport: boolean;
  atArrivalAirport: boolean;
  distanceToDestination: number;
  position: google.maps.LatLng;
  enginerpm: number;
}

@Component({
  selector: 'app-sim-connecter',
  templateUrl: './sim-connecter.component.html',
  styleUrls: ['./sim-connecter.component.scss']
})
export class SimConnecterComponent implements OnInit {

  connection: signalR.HubConnection;
  simData: SimUpdate = <SimUpdate>{};

  private lastUpdate: number = new Date().getTime();
  private frequency: number = 1000;

  job: Job;

  constructor(
    private http: HttpClient,
    public jobService: JobService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.jobService.activeJob.subscribe(j => {
      this.job = j;
      console.log("Job Update", j);
    });

    this.loadJob();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("/simlinkhub")
      .build();

    this.connection
      .start()
      .then(() => {
        console.log("Connection started");
        this.connection.on("PositionObject", (data) => {
          // console.log("Sim Update", JSON.parse(data));
          const current = new Date().toTimeString();
          const next = new Date(this.lastUpdate + this.frequency).toTimeString();
          if (current >= next) {
            this.processUpdate(JSON.parse(data));
          }
        })
      })
      .catch(err => console.log("Error while starting connection: " + err));

  }

  loadJob() {
    this.route.params.subscribe((p: Params) => {
      this.jobService.loadJob(p['job']);
    });
  }

  async requestInitPlugin() {
    const result = await this.http.post<boolean>("/initPlugin", null).toPromise();
  }

  processUpdate(data) {
    this.lastUpdate = new Date().getTime();
    const currentPos = { lat: data.Latitude, lng: data.Longitude };
    data.AtDepartureAirport = this.jobService.atDepartureAirport(currentPos, this.simData.onGround);
    data.AtArrivalAirport = this.jobService.atArrivalAirport(currentPos, this.simData.onGround);
    data.DistanceToDestination = this.jobService.distanceToDestination(currentPos);
    this.simData = data;
    if (this.jobService.activeJob && this.job.status == "Started") {
      this.jobService.update(new FlightUpdate(data));
    }
  }
}
