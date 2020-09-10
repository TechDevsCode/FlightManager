import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from './app.component';
import { SimConnecterComponent } from './sim-connecter/sim-connecter.component';
import { FormsModule } from "@angular/forms";
import { ManageFlightsComponent } from './manage-flights/manage-flights.component';
import { RouterModule } from '@angular/router';
import { FlightService } from './flight.service';
import { MapComponent } from './map/map.component';
import { FlightMonitorComponent } from './monitor-flight/monitor-flight.component';
import { FlightPropertiesComponent } from './flight-properties/flight-properties.component';
import { MessageService } from 'primeng/api';
import { AppPrimeNgModule } from './app-prime-ng.module';
import { AircraftPropertiesComponent } from './aircraft-properties/aircraft-properties.component';
import { FlightCreateComponent } from './flight-create/flight-create.component';
import { AirportMapComponent } from './airport-map/airport-map.component';

@NgModule({
  declarations: [
    AppComponent,
    SimConnecterComponent,
    ManageFlightsComponent,
    FlightMonitorComponent,
    MapComponent,
    FlightPropertiesComponent,
    AircraftPropertiesComponent,
    FlightCreateComponent,
    AirportMapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppPrimeNgModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'flights', pathMatch: "full" },
      { path: 'flights', component: ManageFlightsComponent },
      { path: 'flights/create', component: FlightCreateComponent },
      { path: 'flights/:flightNumber', component: FlightMonitorComponent },
    ])
  ],
  providers: [
    FlightService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
