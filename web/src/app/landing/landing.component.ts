import { Component } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { DataService } from '@services/data.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  sideNavOpen = false;

  constructor(ds: DataService, private authService: AuthService) {
    ds.setup();
  }

  logout() {
    this.authService.logoutUser();
  }
}
