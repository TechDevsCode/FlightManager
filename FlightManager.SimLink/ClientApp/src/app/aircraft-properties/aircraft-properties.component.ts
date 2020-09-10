import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SimUpdate } from '../models/SimUpdate';
import { Flight } from '../models/Flight';
import { FlightService } from '../flight.service';
import { Message } from 'primeng/api/message';

@Component({
  selector: 'app-aircraft-properties',
  templateUrl: './aircraft-properties.component.html',
  styleUrls: ['./aircraft-properties.component.scss']
})
export class AircraftPropertiesComponent implements OnInit, OnChanges {

  @Input() flight: Flight;
  @Input() simUpdate: SimUpdate;

  messages: Message[] = [];

  constructor(
    public flightService: FlightService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.simUpdate) {
      console.log({ "simupdate": this.simUpdate, "flight": this.flight });

      if (this.simUpdate == null || this.simUpdate == <SimUpdate>{}) {
        this.messages.push({ severity: "warn", summary: "Not connected to the sim", detail: "Not receiving any sim data. Make sure the sim is running.", closable: false });
      }

      if (!this.simUpdate.atArrivalAirport && this.flight.status == "Not Started") {
        this.messages.push({ severity: "warn", summary: "Cannot start the job", detail: "You are not at " + this.flight.departure.name, closable: false });
      }
    }
  }

  get canStart() {
    return (!this.simUpdate.atArrivalAirport && this.flight.status == "Not Started") ? false : true;
  }
}
