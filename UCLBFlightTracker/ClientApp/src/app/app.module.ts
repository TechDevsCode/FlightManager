import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from './app.component';
import { SimConnecterComponent } from './sim-connecter/sim-connecter.component';
import { ButtonModule } from "primeng/button";
import { GMapModule } from 'primeng/gmap';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    SimConnecterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ButtonModule,
    GMapModule,
    InputNumberModule,
    FormsModule,
    SliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
