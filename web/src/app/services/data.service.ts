import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { UserDetails, EventFormValue, Event, Category, CategoryFormValue } from '@types';
import { map, take } from 'rxjs/operators';

const API_URL = '/api';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  userDetails: Observable<UserDetails>;

  // TODO: REDO THIS ENTIRE FILE

  constructor(private http: HttpClient, private router: Router) {
    this.userDetails = this.http.get<UserDetails>(API_URL + '/self');

  }

  getEvents(): Observable<Event[]> {
    return this.http.get<any[]>(API_URL + '/events').pipe(
      map(events => events.map(event => ({ ...event, date: moment(event.date, 'YYYY-MM-DD') }))),
      take(1)
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(API_URL + '/categories').pipe(
      take(1)
    );
  }

  newEvent(event: EventFormValue) {
    this.http.post(API_URL + '/event', event).subscribe();
  }

  updateEvent(event: Event) {
    this.http.put(API_URL + '/event', event).subscribe();
  }

  deleteEvent(event: Event): Observable<any> {
    return this.http.delete(API_URL + '/event/' + event.id);
  }

  newCategory(category: CategoryFormValue) {
    this.http.post(API_URL + '/category', { name: category.name, color: category.color }).subscribe();
  }

  updateCategory(category: CategoryFormValue) {
    this.http.put(API_URL + '/category', {id: category.id, name: category.name, color: category.color }).subscribe();
  }

  deleteCategory(category: CategoryFormValue) {
    const id = category.id ? category.id : null;
    this.http.delete(API_URL + '/category/' + id).subscribe();
  }
}
