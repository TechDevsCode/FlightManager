import { Injectable } from '@angular/core';
import { Job, FlightUpdate } from './manage-jobs/manage-jobs.component';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private _activeJob: Job;
  private lastUpdate: number = new Date().getTime();
  private groundedFrequency: number = 60000;
  private groundedMovingFrequency: number = 5000;
  private flyingFrequency: number = 20000;

  constructor() { }
  createJob(job: Job) {
    this._activeJob = job;
    this.localSave();
  }

  get activeJob(): Job {
    if (this._activeJob == null && localStorage.getItem("CurrentJob") != null) {
      const jobNumber = localStorage.getItem("CurrentJob");
      this.loadJob(jobNumber);
    }
    return this._activeJob;
  }

  update(update: FlightUpdate) {
    if (this._activeJob) {
      let refreshFreq: number;
      if (update.grounded && update.spd < 2) {
        refreshFreq = this.groundedFrequency;
      } else if (update.grounded && update.spd >= 2) {
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
    const last = this.activeJob.flightData[this.activeJob.flightData.length - 1];
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

    }
    return update;
  }

  depart() {
    this._activeJob.departureTime = new Date();
    this.localSave();
  }

  takeOff() {
    this._activeJob.takeoffTime = new Date();
    this._activeJob.flightStatus = "In Flight";
    this.localSave();
  }

  land() {
    this._activeJob.landTime = new Date();
    this._activeJob.flightStatus = "Arrival Taxi";
    this.localSave();
  }

  startTaxi() {
    this._activeJob.flightStatus = "Departure Taxi";
    this.localSave();
  }

  engineShutdown() {
    // Complete the job

    this.localSave();
  }

  localSave() {
    localStorage.setItem(this._activeJob.jobNumber.toString(), JSON.stringify(this._activeJob));
  }

  startJob() {
    if (this._activeJob) {
      this._activeJob.status = "Started";
      this.localSave();
    }
  }

  loadJob(jobNumber: string) {
    // console.log("loading job# ", jobNumber);
    const job = localStorage.getItem(jobNumber.toString());
    // console.log("got job ", job);
    // console.log("got job parsed", JSON.parse(job));
    if (job == null) {
      console.log("Job not found");
    } else {
      this._activeJob = JSON.parse(job);
      localStorage.setItem("CurrentJob", jobNumber.toString());
    }
  }

  listJobs(): Job[] {
    let jobs = [];
    for (var key in localStorage) {
      const j: Job = JSON.parse(localStorage.getItem(key));
      if (j && j.jobNumber) {
        jobs.push(j);
      }
    }
    return jobs;
  }

  deleteJob(jobNumber: string) {
    localStorage.removeItem(jobNumber.toString());
  }

  measureDistance(from, to): number {
    const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
    const toLatLng = new google.maps.LatLng(to.lat, to.lng);
    return Math.round(google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng));
  }
}
