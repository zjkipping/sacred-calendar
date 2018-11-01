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
  loadingEvents = false;

  constructor(private http: HttpClient, private router: Router) {
    this.userDetails = this.http.get<UserDetails>(API_URL + '/self');
  }

  loadEvents() {
    this.loadingEvents = true;
    this.fetchEvents();
  }

  // fetches the events from the API
  fetchEvents() {
    this.http.get<any[]>(API_URL + '/events').pipe(
      // converts the date from a string to a Moment object
      map(events => events.map(event => ({ ...event, date: moment(event.date, 'YYYY-MM-DD') }))),
      // ensures that the stream ends once 1 response is given back
      take(1),
      // set the loading boolean to false
      tap(() => this.loadingEvents = false),
      map(events => {
        // set the fontColor's for the various categories in the event
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

  // get the categories back for the user from the API
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(API_URL + '/categories').pipe(
      take(1),
      map(categories => {
        // set the fontColor for the various categories
        return categories.map(category => {
          const fontColor = getContrastYIQ(category.color);
          return { ...category, fontColor };
        });
      })
    );
  }

  // sends off the new event post to the API
  newEvent(event: EventFormValue): Observable<any> {
    return this.http.post(API_URL + '/event', event).pipe(take(1));
  }

  // sends off the update event put to the API
  updateEvent(event: Event): Observable<any> {
    return this.http.put(API_URL + '/event', event).pipe(take(1));
  }

  // sends off the delete event to the API
  deleteEvent(event: Event): Observable<any> {
    return this.http.delete(API_URL + '/event/' + event.id).pipe(take(1));
  }

  // sends off the new category post to the API
  newCategory(category: CategoryFormValue): Observable<any> {
    return this.http.post(API_URL + '/category', { name: category.name, color: category.color }).pipe(take(1));
  }

  // sends off the update category put to the API
  updateCategory(category: CategoryFormValue): Observable<any> {
    return this.http.put(API_URL + '/category', {id: category.id, name: category.name, color: category.color }).pipe(take(1));
  }

  // sends off the delete category to the API
  deleteCategory(category: CategoryFormValue): Observable<any> {
    const id = category.id ? category.id : null;
    return this.http.delete(API_URL + '/category/' + id).pipe(take(1));
  }
}

/*
  Reference https://24ways.org/2010/calculating-color-contrast
*/
// returns back either 'white' or 'black' depending on the background hex provided
// provides contrast so the text ontop of the background color is readable
function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.slice(1, hexcolor.length - 1);
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}
