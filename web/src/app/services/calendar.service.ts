import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';

import { CalendarDate, Event } from '@types';
import { DataService } from './data.service';


@Injectable({
  providedIn: 'root'
})
export class CalendarService implements OnDestroy {
  selected = new BehaviorSubject<CalendarDate | undefined>(undefined);
  current = new BehaviorSubject<moment.Moment>(moment());
  days = new BehaviorSubject<CalendarDate[]>([]);

  selectedDate = new BehaviorSubject<moment.Moment | undefined>(undefined);

  private dateGenerator: Subscription;

  constructor(ds: DataService) {
    // used to generate the dates for the calendar whenever the events, selectedDate, or currentDate changes
    this.dateGenerator = combineLatest<[moment.Moment | undefined, Event[], moment.Moment]>(
      this.selectedDate,
      ds.events,
      this.current
    ).subscribe(([selected, events, current]) => {
      // generates the dates for the calendar views
      const dates = GenerateDates(events, current, selected);
      // update the selected day with the correct events data
      const newSelected = _.find(dates, { selected: true });
      if (newSelected) {
        this.selected.next(newSelected);
      }
      // pushes the generated dates down the data stream
      this.days.next(dates);
    });
  }

  ngOnDestroy() {
    // unsubscribes from the date generator combined observable
    this.dateGenerator.unsubscribe();
  }

  nextMonth() {
    // set the current month to the next one
    this.current.next(moment(this.current.value).add(1, 'months'));
  }

  previousMonth() {
    // sets the current month to the previous one
    this.current.next(moment(this.current.value).subtract(1, 'months'));
  }

  /**
  * @returns true if day was already selected, false otherwise
  */
  selectDate(date: CalendarDate): boolean {
    // sets the selected date to the one provided in the arguments
    if (this.selectedDate.value && date.mDate.isSame(this.selectedDate.value, 'day')) {
      // if the date provided is already selected, it de-selects it
      this.selectedDate.next(undefined);
      return true;
    } else {
      this.selectedDate.next(date.mDate);
      return false;
    }
  }

  deselectDate() {
    // deselects the currently selected date
    this.selected.next(undefined);
    this.selectedDate.next(undefined);
  }
}

function GenerateDates(events: Event[], current: moment.Moment, selected: moment.Moment | undefined): CalendarDate[] {
  // grabs the start of the 6 week period
  const start = moment(current).startOf('month').subtract(moment(current).startOf('month').day(), 'days');
  const startDate = start.date();

  // creates an array starting at the start date through to 42 days later
  return _
    .range(startDate, startDate + 42)
    .map(date => SetDate(moment(start).date(date), events, current, selected));
}

function SetDate(date: moment.Moment, rawEvents: Event[], current: moment.Moment, selected: moment.Moment | undefined): CalendarDate {
  const events = _.chain(rawEvents)
    .filter(event => {
      // filter the events to only those are on the current date
      return event.date.isSame(date, 'day');
    })
    // sorting the filtered events by their start time (early -> late)
    .sortBy((event: Event) => {
      // hack to get around time sorting until we use UNIX time stamps...
      const parts = event.startTime.split(':');
      const right = parts[1].split(' ');
      let hours = Number.parseInt(parts[0] + '00', undefined);
      const minutes = Number.parseInt(right[0], undefined);
      if (right[1] === 'pm') {
        hours += 1200;
      }
      return hours + minutes;
    })
    .value();

  // return the calendarDate object back
  return {
    events,
    mDate: date,
    selected: selected ? selected.isSame(date, 'day') : false,
    today: moment().isSame(date, 'day'),
    disabled: !current.isSame(date, 'month')
  };
}
