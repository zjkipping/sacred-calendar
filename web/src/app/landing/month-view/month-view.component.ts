import { Component, Input, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { CalendarDate, Event } from '@types';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss']
})
export class MonthViewComponent {
  // TODO: redo naming of this later
  private selectedDate?: CalendarDate;
  @Input() set selected(value: CalendarDate) {
    this.selectedDate = value;
    this.days = GenerateDates(this.rawEvents, this.currentMonthYear, this.selectedDate);
  }

  private rawEvents: Event[] = [];
  @Input() set events(raw: Event[]) {
    this.rawEvents = raw ? raw : [];
    this.days = GenerateDates(this.rawEvents, this.currentMonthYear, this.selectedDate);
  }

  @Output() dateSelected = new EventEmitter<CalendarDate>();
  @Output() eventSelected = new EventEmitter<Event>();

  testData: number[] = [];
  days: CalendarDate[] = [];
  currentMonthYear: moment.Moment;
  // yearSelect: FormControl;

  constructor() {
    this.currentMonthYear = moment();

    // idk how I want to do year easy changing yet... more buttons looks messy. highly stylized number control?
    // this.yearSelect = new FormControl(this.currentMonthYear.year());
  }

  nextMonth() {
    this.currentMonthYear = moment(this.currentMonthYear).add(1, 'months');
    this.days = GenerateDates(this.rawEvents, this.currentMonthYear, this.selectedDate);
  }

  previousMonth() {
    this.currentMonthYear = moment(this.currentMonthYear).subtract(1, 'months');
    this.days = GenerateDates(this.rawEvents, this.currentMonthYear, this.selectedDate);
  }

  selectDate(date: CalendarDate) {
    if (!date.disabled) {
      this.dateSelected.emit(date);
    }
  }
}

function GenerateDates(events: Event[], current: moment.Moment, selected: CalendarDate | undefined): CalendarDate[] {
  const start = moment(current).startOf('month').subtract(moment(current).startOf('month').day(), 'days');
  const startDate = start.date();

  return _
  .range(startDate, startDate + 42)
  .map(date => SetDate(moment(start).date(date), events, current, selected));
}

function SetDate(date: moment.Moment, rawEvents: Event[], current: moment.Moment, selected: CalendarDate | undefined): CalendarDate {
  const events = rawEvents.filter(event => {
    return event.date.isSame(date, 'day');
  });

  // TODO: sort events by time

  return {
    events,
    mDate: date,
    selected: selected ? selected.mDate.isSame(date, 'day') : false,
    today: moment().isSame(date, 'day'),
    disabled: !current.isSame(date, 'month')
  };
}
