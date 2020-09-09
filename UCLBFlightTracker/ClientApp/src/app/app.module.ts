import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from './app.component';
import { SimConnecterComponent } from './sim-connecter/sim-connecter.component';
import { ButtonModule } from "primeng/button";
import { GMapModule } from 'primeng/gmap';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from "@angular/forms";
import { ManageJobsComponent } from './manage-jobs/manage-jobs.component';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { JobService } from './job.service';
import { ToggleButtonModule } from 'primeng/togglebutton';

@NgModule({
  declarations: [
    AppComponent,
    SimConnecterComponent,
    ManageJobsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ButtonModule,
    GMapModule,
    InputNumberModule,
    FormsModule,
    SliderModule,
    MenubarModule,
    DropdownModule,
    ToggleButtonModule,
    RouterModule.forRoot([
      { path: '', component: ManageJobsComponent },
      { path: 'sim_connect', component: SimConnecterComponent },
      { path: 'manage_jobs', component: ManageJobsComponent },
    ])
  ],
  providers: [
    JobService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
