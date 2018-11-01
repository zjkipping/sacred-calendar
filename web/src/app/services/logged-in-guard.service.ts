import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuardService implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  // guards against the user being logged in and trying to access login or register pages
  canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
      if (!!this.auth.refreshToken) {
        // routes back to the calendar (landing) page
        this.router.navigate(['/calendar']);
      }
      return !this.auth.refreshToken;
  }
}
