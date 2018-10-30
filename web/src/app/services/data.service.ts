import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { UserDetails, EventFormValue, Event, Category, CategoryFormValue } from '@types';
import { map, take } from 'rxjs/operators';

import { environment } from '../../environments/environment';

const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  userDetails: Observable<UserDetails>;
  events = new BehaviorSubject<Event[]>([]);

  constructor(private http: HttpClient, private router: Router) {
    this.userDetails = this.http.get<UserDetails>(API_URL + '/self');
    this.fetchEvents();
  }

  fetchEvents() {
    this.http.get<any[]>(API_URL + '/events').pipe(
      map(events => events.map(event => ({ ...event, date: moment(event.date, 'YYYY-MM-DD') }))),
      take(1)
    ).subscribe(res => this.events.next(res));
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(API_URL + '/categories').pipe(take(1));
  }

  newEvent(event: EventFormValue): Observable<any> {
    return this.http.post(API_URL + '/event', event).pipe(take(1));
  }

  updateEvent(event: Event): Observable<any> {
    return this.http.put(API_URL + '/event', event).pipe(take(1));
  }

  deleteEvent(event: Event): Observable<any> {
    return this.http.delete(API_URL + '/event/' + event.id).pipe(take(1));
  }

  newCategory(category: CategoryFormValue): Observable<any> {
    return this.http.post(API_URL + '/category', { name: category.name, color: category.color }).pipe(take(1));
  }

  updateCategory(category: CategoryFormValue): Observable<any> {
    return this.http.put(API_URL + '/category', {id: category.id, name: category.name, color: category.color }).pipe(take(1));
  }

  deleteCategory(category: CategoryFormValue): Observable<any> {
    const id = category.id ? category.id : null;
    return this.http.delete(API_URL + '/category/' + id).pipe(take(1));
  }
}
