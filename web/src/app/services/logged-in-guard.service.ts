import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuardService implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
      if (!!this.auth.refreshToken) {
        this.router.navigate(['/calendar']);
      }
      return !this.auth.refreshToken;
  }
}
