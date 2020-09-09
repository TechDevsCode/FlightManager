import { Injectable } from '@angular/core';
import { Job, FlightUpdate } from './manage-jobs/manage-jobs.component';
import { Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Injectable({
  providedIn: 'root'
})
export class JobService {


  private _activeJob: Job;
  private activeJobSubject = new Subject<Job>();
  activeJob = this.activeJobSubject.asObservable();

  private lastUpdate: number = new Date().getTime();
  private groundedFrequency: number = 60000;
  private groundedMovingFrequency: number = 5000;
  private flyingFrequency: number = 20000;

  constructor(
    private msgService: MessageService
  ) { }

  createJob(job: Job) {
    this._activeJob = job;
    this.localSave();
  }

  // get activeJob(): Job {
  //   if (this._activeJob == null && localStorage.getItem("CurrentJob") != null) {
  //     const jobNumber = localStorage.getItem("CurrentJob");
  //     this.loadJob(jobNumber);
  //   }
  //   return this._activeJob;
  // }

  update(update: FlightUpdate) {
    if (this._activeJob) {
      let refreshFreq: number;
      if (update.grounded && update.parkingBrake) {
        refreshFreq = this.groundedFrequency;
      } else if (update.grounded && !update.parkingBrake) {
        refreshFreq = this.groundedMovingFrequency;
      } else if (!update.grounded) {
        refreshFreq = this.flyingFrequency
      } else {
        refreshFreq = this.flyingFrequency;
      }
      const current = new Date().toTimeString();
      const next = new Date(this.lastUpdate + refreshFreq).toTimeString();

      if (current >= next) {
        this.lastUpdate = new Date().getTime();
        console.log("Saving flight update");
        update = this.processFligtData(update);
        this._activeJob.flightData.push(update);
        this.localSave();
      }
    }
  }

  public get lastFlightUpdate(): FlightUpdate {
    const last = this._activeJob.flightData[this._activeJob.flightData.length - 1];
    return last;
  }

  private processFligtData(update: FlightUpdate): FlightUpdate {
    const last = this.lastFlightUpdate;

    if (last) {


      const current = update;

      if (last.grounded && current.grounded == false) {
        this.takeOff();
      }

      if (last.grounded == false && current.grounded == true) {
        this.land();
      }

      if (current.grounded && last.spd < 2 && current.spd >= 2) {
        this.startTaxi();
      }

      if (current.parkingBrake == true && current.spd < 2 && current.enginerpm == 0 && this.atDepartureAirport(current.pos, current.grounded)) {
        this.completeJob();
      }

    }
    return update;
  }

  takeOff() {
    this._activeJob.takeoffTime = new Date();
    this._activeJob.flightStatus = "In Flight";
    this.notifySuccess('Job ' + this._activeJob.jobNumber + ' Take Off!', 'Taken off from ' + this._activeJob.arrival.name + ' at ' + new Date().toLocaleTimeString());
    this.localSave();
  }

  land() {
    this._activeJob.landTime = new Date();
    this._activeJob.flightStatus = "Arrival Taxi";
    this.notifySuccess('Job ' + this._activeJob.jobNumber + ' Landed!', 'Landed at ' + this._activeJob.departure.name + ' at ' + new Date().toLocaleTimeString());
    this.localSave();
  }

  startTaxi() {
    this.notifySuccess('Job ' + this._activeJob.jobNumber + ' Taxi Started!', 'Started taxi at ' + this._activeJob.arrival.name);
    this._activeJob.flightStatus = "Departure Taxi";
    this.localSave();
  }

  completeJob() {
    this.notifySuccess('Job ' + this._activeJob.jobNumber + ' Completed!', 'Arrived into ' + this._activeJob.arrival.name + ' at ' + new Date().toLocaleTimeString());
    this._activeJob.flightStatus = "Parked!";
    this._activeJob.status = "Completed";
    this.localSave();
  }

  notifySuccess(title: string, detail: string) {
    this.msgService.add({ severity: 'success', summary: title, detail: detail, sticky: false });
    console.info(title);
  }

  localSave() {
    localStorage.setItem("Job#-" + this._activeJob.jobNumber.toString(), JSON.stringify(this._activeJob));
    this.activeJobSubject.next(this._activeJob);
  }

  startJob() {
    if (this._activeJob) {
      this.notifySuccess('Job ' + this._activeJob.jobNumber + ' Started!', 'Parked at ' + this._activeJob.arrival.name);
      this._activeJob.status = "Started";
      this.localSave();
    }
  }

  loadJob(jobNumber: string) {
    const job = localStorage.getItem("Job#-" + jobNumber.toString());
    if (job == null) {
      console.log("Job not found");
    } else {
      this._activeJob = JSON.parse(job);
      localStorage.setItem("CurrentJob", jobNumber.toString());
    }
    this.activeJobSubject.next(this._activeJob);
  }

  listJobs(): Job[] {
    let jobs = [];
    for (var key in localStorage) {
      if (key.startsWith("Job#-")) {
        const j: Job = JSON.parse(localStorage.getItem(key));
        if (j && j.jobNumber) {
          jobs.push(j);
        }
      }
    }
    return jobs;
  }

  deleteJob(jobNumber: string) {
    localStorage.removeItem("Job#-" + jobNumber.toString());
  }

  measureDistance(from, to): number {
    const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
    const toLatLng = new google.maps.LatLng(to.lat, to.lng);
    return Math.round(google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng));
  }

  atDepartureAirport(currentPos, grounded) {
    const distanceFromAirport = this.measureDistance(currentPos, this._activeJob.departure.position);
    return (distanceFromAirport <= 2000 && grounded);
  }

  atArrivalAirport(currentPos, grounded) {
    const distanceFromAirport = this.measureDistance(currentPos, this._activeJob.arrival.position);
    return (distanceFromAirport <= 2000 && grounded);
  }

  distanceToDestination(currentPos): number {
    return Math.round(this.measureDistance(currentPos, this._activeJob.arrival.position) / 1000);
  }
}
