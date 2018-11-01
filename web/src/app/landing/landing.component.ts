import { Component } from '@angular/core';
import { DataService } from '@services/data.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  constructor(ds: DataService) {
    ds.loadEvents();
  }
}
