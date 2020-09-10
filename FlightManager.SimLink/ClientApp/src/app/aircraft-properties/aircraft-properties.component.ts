import { Component, OnInit, Input } from '@angular/core';
import { SimUpdate } from '../models/SimUpdate';
import { Flight } from '../models/Flight';

@Component({
  selector: 'app-aircraft-properties',
  templateUrl: './aircraft-properties.component.html',
  styleUrls: ['./aircraft-properties.component.scss']
})
export class AircraftPropertiesComponent implements OnInit {

  @Input() flight: Flight;
  @Input() simUpdate: SimUpdate;

  constructor() { }

  ngOnInit(): void {
  }

}
