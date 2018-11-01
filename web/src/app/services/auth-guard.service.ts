import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  // guards against not having any auth when trying to access the landing part of the application
  canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
      if (!this.auth.refreshToken) {
        // re-routes to the login page
        this.router.navigate(['/login']);
      }
      return !!this.auth.refreshToken;
  }
}
