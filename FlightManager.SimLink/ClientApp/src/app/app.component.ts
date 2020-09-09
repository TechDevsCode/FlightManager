import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ClientApp';
  items: MenuItem[];

  ngOnInit() {
    this.items = [
      // { label: "Sim Connect", icon: "fas fa-plane-departure", routerLink: ['sim_connect'] },
      { label: "Jobs", icon: "pi pi-cog", routerLink: ['manage_jobs'] },
    ];
  }
}
