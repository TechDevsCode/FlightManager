import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from './app.component';
import { SimConnecterComponent } from './sim-connecter/sim-connecter.component';
import { ButtonModule } from "primeng/button";
import { GMapModule } from 'primeng/gmap';

@NgModule({
  declarations: [
    AppComponent,
    SimConnecterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ButtonModule,
    GMapModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
