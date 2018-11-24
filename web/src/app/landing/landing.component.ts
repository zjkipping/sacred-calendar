import { Component } from '@angular/core';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  sideNavOpen = false;

  constructor(private authService: AuthService) { }

  logout() {
    this.authService.logoutUser();
  }
}
