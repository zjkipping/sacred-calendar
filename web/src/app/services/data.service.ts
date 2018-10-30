import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { UserDetails, EventFormValue, Event, Category, CategoryFormValue } from '@types';
import { map, take, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  userDetails: Observable<UserDetails>;
  events = new BehaviorSubject<Event[]>([]);
  loadingEvents: boolean;

  constructor(private http: HttpClient, private router: Router) {
    this.userDetails = this.http.get<UserDetails>(API_URL + '/self');
    this.loadingEvents = true;
    this.fetchEvents();
  }

  fetchEvents() {
    this.http.get<any[]>(API_URL + '/events').pipe(
      map(events => events.map(event => ({ ...event, date: moment(event.date, 'YYYY-MM-DD') }))),
      take(1),
      tap(() => this.loadingEvents = false),
      map(events => {
        return events.map(event => {
          let fontColor = 'white';
          if (event.category && event.category.color) {
            fontColor = getContrastYIQ(event.category.color);
          }
          return { ...event, fontColor };
        });
      })
    ).subscribe(res => this.events.next(res));
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(API_URL + '/categories').pipe(
      take(1),
      map(categories => {
        return categories.map(category => {
          const fontColor = getContrastYIQ(category.color);
          return { ...category, fontColor };
        });
      })
    );
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

/*
  Reference https://24ways.org/2010/calculating-color-contrast
*/
function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.slice(1, hexcolor.length - 1);
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}
