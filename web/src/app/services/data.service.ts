import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserDetails } from '@types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  userDetails: Observable<UserDetails>;

  constructor(private http: HttpClient, private router: Router) {
    this.userDetails = this.http.get<UserDetails>('/api' + '/self');
  }
}
