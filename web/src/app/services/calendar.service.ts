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
    this.dateGenerator = combineLatest<[moment.Moment | undefined, Event[], moment.Moment]>(
      this.selectedDate,
      ds.events,
      this.current
    ).subscribe(([selected, events, current]) => {
      const dates = GenerateDates(events, current, selected);
      const newSelected = _.find(dates, { selected: true });
      if (newSelected) {
        this.selected.next(newSelected);
      }
      this.days.next(dates);
    });
  }

  ngOnDestroy() {
    this.dateGenerator.unsubscribe();
  }

  nextMonth() {
    this.current.next(moment(this.current.value).add(1, 'months'));
  }

  previousMonth() {
    this.current.next(moment(this.current.value).subtract(1, 'months'));
  }

  /**
  * @returns true if day was already selected, false otherwise
  */
  selectDate(date: CalendarDate): boolean {
    if (this.selectedDate.value && date.mDate.isSame(this.selectedDate.value, 'day')) {
      this.selectedDate.next(undefined);
      return true;
    } else {
      this.selectedDate.next(date.mDate);
      return false;
    }
  }

  deselectDate() {
    this.selected.next(undefined);
    this.selectedDate.next(undefined);
  }
}

function GenerateDates(events: Event[], current: moment.Moment, selected: moment.Moment | undefined): CalendarDate[] {
  const start = moment(current).startOf('month').subtract(moment(current).startOf('month').day(), 'days');
  const startDate = start.date();

  return _
    .range(startDate, startDate + 42)
    .map(date => SetDate(moment(start).date(date), events, current, selected));
}

function SetDate(date: moment.Moment, rawEvents: Event[], current: moment.Moment, selected: moment.Moment | undefined): CalendarDate {
  const events = _.chain(rawEvents)
    .filter(event => {
      return event.date.isSame(date, 'day');
    })
    .sortBy((event: Event) => event.startTime)
    .value();

  return {
    events,
    mDate: date,
    selected: selected ? selected.isSame(date, 'day') : false,
    today: moment().isSame(date, 'day'),
    disabled: !current.isSame(date, 'month')
  };
}
