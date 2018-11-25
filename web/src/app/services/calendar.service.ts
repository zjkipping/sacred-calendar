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
  view = new BehaviorSubject(window.innerWidth < 720 ? 'weekly' : 'monthly');

  selectedDate = new BehaviorSubject<moment.Moment | undefined>(undefined);

  private dateGenerator: Subscription;

  constructor(ds: DataService) {
    // used to generate the dates for the calendar whenever the events, selectedDate, or currentDate changes
    this.dateGenerator = combineLatest<[moment.Moment | undefined, Event[], moment.Moment, string]>(
      this.selectedDate,
      ds.events,
      this.current,
      this.view
    ).subscribe(([selected, events, current, view]) => {
      let dates: CalendarDate[] = [];
      // generates the dates for the calendar views
      if (view === 'monthly') {
        dates = GenerateMonthlyDates(events, current, selected);
      } else {
        dates = GenerateWeeklyDates(events, current, selected);
      }
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

  setView(value: string) {
    this.view.next(value);
  }

  nextMonth() {
    // set the current month to the next one
    this.current.next(moment(this.current.value).add(1, 'months'));
  }

  previousMonth() {
    // sets the current month to the previous one
    this.current.next(moment(this.current.value).subtract(1, 'months'));
  }

  nextWeek() {
    this.current.next(moment(this.current.value).add(1, 'week'));
  }

  previousWeek() {
    this.current.next(moment(this.current.value).subtract(1, 'week'));
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

export function GenerateMonthlyDates(events: Event[], current: moment.Moment, selected: moment.Moment | undefined): CalendarDate[] {
  // grabs the start of the 6 week period
  const start = moment(current).startOf('month').subtract(moment(current).startOf('month').day(), 'days');
  const startDate = start.date();

  // creates an array starting at the start date through to 42 days later
  return _
    .range(startDate, startDate + 42)
    .map(date => SetDate(moment(start).date(date), events, current, selected));
}

export function GenerateWeeklyDates(events: Event[], current: moment.Moment, selected: moment.Moment | undefined): CalendarDate[] {
  const start = moment(current).startOf('week');
  const startDate = start.date();

  return _
    .range(startDate, startDate + 7)
    .map(date => SetDate(moment(start).date(date), events, current, selected));
}

function SetDate(date: moment.Moment, rawEvents: Event[], current: moment.Moment, selected: moment.Moment | undefined): CalendarDate {
  const events = _.chain(rawEvents)
    .filter(event => {
      // filter the events to only those are on the current date
      return event.date.isSame(date, 'day');
    })
    // sorting the filtered events by their start time (early -> late)
    .sortBy((event: Event) => event.startTime.unix())
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
