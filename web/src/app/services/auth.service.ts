import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserDetails } from '@types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  refreshToken = '';
  clientToken = '';
  user?: UserDetails;

  constructor(private http: HttpClient) {

  }

  registerUser(username: string, firstName: string, lastName: string, email: string, password: string): Observable<any> {
    return this.http.post('/api' + '/register', { username, firstName, lastName, email, password });
  }

  loginUser(username: string, password: string) {
    return this.http.post('/api' + '/login', { username, password }).pipe(
      tap((res: any) => {
        this.refreshToken = res.refreshToken;
        this.clientToken = res.token;
      })
    );
  }
}
