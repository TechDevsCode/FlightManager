import { Component, OnInit } from '@angular/core';
import { SimUpdate } from '../models/SimUpdate';
import { Flight } from '../models/Flight';
import { HttpClient } from '@angular/common/http';
import { FlightService } from '../flight.service';
import { ActivatedRoute, Params } from '@angular/router';
import * as signalR from '@aspnet/signalr';
import { FlightUpdate } from '../models/FlightUpdate';

@Component({
  selector: 'app-monitor-flight',
  templateUrl: './monitor-flight.component.html',
  styleUrls: ['./monitor-flight.component.scss']
})
export class FlightMonitorComponent implements OnInit {


  connection: signalR.HubConnection;
  simData: SimUpdate = <SimUpdate>{};

  private lastUpdate: number = new Date().getTime();
  private frequency: number = 1000;

  flight: Flight;

  constructor(
    private http: HttpClient,
    public jobService: FlightService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.jobService.activeFlight.subscribe(j => {
      this.flight = j;
      console.log("Job Update", j);
    });
    this.route.params.subscribe((p: Params) => {
      this.jobService.loadFlight(p['flightNumber']);
    });

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
    if (this.jobService.activeFlight && this.flight.status == "Started") {
      this.jobService.updateFlight(new FlightUpdate(data));
    }
  }

}
