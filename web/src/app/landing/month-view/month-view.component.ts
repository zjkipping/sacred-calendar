import { Component, Input, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';

import { CalendarDate, Event } from '@types';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss']
})
export class MonthViewComponent {
  @Input() days: CalendarDate[] = [];
  @Input() current: moment.Moment = moment();

  @Output() dateSelected = new EventEmitter<CalendarDate>();
  @Output() eventSelected = new EventEmitter<Event>();
  @Output() monthForward = new EventEmitter();
  @Output() monthBackward = new EventEmitter();

  // TODO: allow for yearForward/yearBackward

  constructor() { }

  nextMonth() {
    this.monthForward.emit();
  }

  previousMonth() {
    this.monthBackward.emit();
  }

  selectDate(date: CalendarDate) {
    if (!date.disabled) {
      this.dateSelected.emit(date);
    }
  }
}
