import { Component } from '@angular/core';

import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  constructor(authService: AuthService) {
    console.log(authService.refreshToken, authService.clientToken);
  }
}
