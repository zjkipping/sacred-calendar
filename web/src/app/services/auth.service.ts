import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, take } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  refreshToken = '';
  clientToken = '';

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) {
    // grabs the refreshToken from the browser's cookies (whether it exists or not)
    this.refreshToken = this.cookieService.get('token');
  }

  // used to send the register info to the proper route in the API
  registerUser(username: string, firstName: string, lastName: string, email: string, password: string): Observable<any> {
    return this.http.post(API_URL + '/register', { username, firstName, lastName, email, password }).pipe(take(1));
  }

  // used to send the login information to the proper route in the API
  loginUser(username: string, password: string, remember: boolean): Observable<any> {
    return this.http.post(API_URL + '/login', { username, password }).pipe(
      take(1),
      tap((res: any) => {
        this.refreshToken = res.refreshToken;
        this.clientToken = res.token;
        if (remember) {
          this.cookieService.set('token', res.refreshToken);
        }
      })
    );
  }

  // used to log the user out of the system by contacting the API
  logoutUser(): void {
    this.http.post(API_URL + '/logout', { refreshToken: this.refreshToken }).pipe(
      take(1)
    ).subscribe(() => {
      this.clearAuth();
    });
  }

  // clears the local auth variables/cookies, redirects to the login page
  clearAuth(): void {
    this.cookieService.delete('token');
    this.refreshToken = '';
    this.clientToken = '';
    this.router.navigate(['/login']);
  }

  // used to get a new clientToken from the API
  getNewClientToken(): Observable<any> {
    return this.http.post(API_URL + '/token', { refreshToken: this.refreshToken }).pipe(
      take(1),
      tap(res => this.clientToken = res.token),
    );
  }
}
