import { Component, OnInit, Input } from '@angular/core';
import { Flight } from '../models/Flight';

@Component({
  selector: 'app-flight-properties',
  templateUrl: './flight-properties.component.html',
  styleUrls: ['./flight-properties.component.scss']
})
export class FlightPropertiesComponent implements OnInit {

  @Input() flight: Flight;

  constructor() { }

  ngOnInit(): void {
  }

}
