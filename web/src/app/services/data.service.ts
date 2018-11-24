import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import * as moment from 'moment';

import { EventFormValue, Event, Category, CategoryFormValue, Friend, Notification, EventInvite } from '@types';
import { map, take, tap, pluck, switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  events = new BehaviorSubject<Event[]>([]);
  eventInvites = new BehaviorSubject<EventInvite[]>([]);
  friends = new BehaviorSubject<Friend[]>([]);
  friendRequests = new BehaviorSubject<Notification[]>([]);
  loadingEvents = false;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private auth: AuthService) { }

  setup() {
    this.loadingEvents = true;
    of(this.auth.clientToken).pipe(
      switchMap(token => {
        if (!token) {
          return this.auth.getNewClientToken();
        } else {
          return of({});
        }
      }),
      tap(() => {
        this.fetchEvents();
        this.fetchFriends();
        this.fetchFriendRequests();
        this.fetchEventInvites();
      })
    ).pipe(take(1)).subscribe();
  }

  // fetches the events from the API
  fetchEvents() {
    this.route.queryParams.pipe(
      take(1),
      pluck<Params, number>('view_friend'),
      // checking if calendar is viewing a friend's events or not
      switchMap(friendID => {
        if (friendID) {
          return this.http.get<any[]>(API_URL + `/friend?id=${friendID}`);
        } else {
          return this.http.get<any[]>(API_URL + '/events');
        }
      }),
      map(events => events.map(event => {
        return {
          ...event,
          date: moment.unix(event.date),
          startTime: moment.unix(event.startTime),
          endTime: event.endTime ? moment.unix(event.endTime) : undefined
        };
      })),
      // ensures that the stream ends once 1 response is given back
      map(events => {
        // set the fontColor's for the various categories in the event
        return events.map(event => {
          let fontColor = 'white';
          if (event.category && event.category.color) {
            fontColor = getContrastYIQ(event.category.color);
          }
          return { ...event, fontColor };
        });
      }),
      take(1),
      // set the loading boolean to false
      tap(() => this.loadingEvents = false)
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

  fetchFriends() {
     this.http.get<Friend[]>(API_URL + '/friends').pipe(take(1)).subscribe(data => this.friends.next(data));
  }

  fetchFriendRequests() {
    this.http.get<Notification[]>(API_URL + '/friend-requests').pipe(take(1)).subscribe(data => this.friendRequests.next(data));
  }

  fetchEventInvites() {
    this.http.get<any[]>(API_URL + '/event-invites').pipe(
      map(invites => invites.map(invite => {
        return {
          ...invite,
          date: moment.unix(invite.date),
          startTime: moment.unix(invite.startTime),
          endTime: invite.endTime ? moment.unix(invite.endTime) : undefined
        };
      }))
    ).subscribe(data => this.eventInvites.next(data));
  }

  // sends off the new event post to the API
  newEvent(event: EventFormValue): Observable<any> {
    return this.http.post(API_URL + '/event', formEventParseDateTimes(event)).pipe(take(1));
  }

  // sends off the update event put to the API
  updateEvent(event: EventFormValue): Observable<any> {
    return this.http.put(API_URL + '/event', formEventParseDateTimes(event)).pipe(take(1));
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

  getFriendTypeAhead(username: string): Observable<any> {
    return this.http.get(API_URL + '/fr-typeahead?username=' + username).pipe(take(1));
  }

  sendFriendRequest(id: number): Observable<any> {
    return this.http.post(API_URL + '/friend-requests', { id }).pipe(take(1));
  }

  acceptFriendRequest(id: number): Observable<any> {
    return this.http.post(API_URL + '/friend-requests/accept', { id }).pipe(take(1));
  }

  denyFriendRequest(id: number): Observable<any> {
    return this.http.post(API_URL + '/friend-requests/deny', { id }).pipe(take(1));
  }

  updateFriend(friend: Friend): Observable<any> {
    return this.http.put(API_URL + '/friends', { id: friend.id, tag: friend.tag, privacyType: friend.privacyType }).pipe(take(1));
  }

  removeFriend(id: number): Observable<any> {
    return this.http.delete(API_URL + '/friends/' + id).pipe(take(1));
  }

  getAvailableFriends(event: EventFormValue): Observable<Notification[]> {
    const momentEvent = formEventParseDateTimes(event);
    return this.http.get<Notification[]>(API_URL + `/availability?start=${momentEvent.startTime}&end=${momentEvent.endTime}`).pipe(take(1));
  }

  sendEventInvites(id: number, invites: number[]): Observable<any> {
    return this.http.post(API_URL + '/event/invite', { id, invites }).pipe(take(1));
  }

  acceptEventInvite(id: number): Observable<any> {
    return this.http.post(API_URL + '/event/accept', { id }).pipe(take(1));
  }

  denyEventInvite(id: number) {
    return this.http.post(API_URL + '/event/deny', { id }).pipe(take(1));
  }
}

/*
  Reference https://24ways.org/2010/calculating-color-contrast
*/
// returns back either 'white' or 'black' depending on the background hex provided
// provides contrast so the text ontop of the background color is readable
export function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.slice(1, hexcolor.length - 1);
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}

export function formEventParseDateTimes(event: EventFormValue) {
  const date = moment(event.date).hours(0).minutes(0).seconds(0).milliseconds(0);
  return {
    ...event,
    date: date.unix(),
    startTime: convertTimeToMomentDate(event.startTime, date).unix(),
    endTime: event.endTime !== '' ? convertTimeToMomentDate(event.endTime, date).unix() : undefined
  };
}

export function convertTimeToMomentDate(time: string, date: moment.Moment) {
  const timeColonSplit = time.split(':');
  const timeSpaceSplit = timeColonSplit[1].split(' ');
  const minutes = Number(timeSpaceSplit[0]);
  const hours = Number(timeColonSplit[0]) + (timeSpaceSplit[1] === 'pm' ? 12 : 0);
  return moment(date).hours(hours).minutes(minutes).milliseconds(0);
}
