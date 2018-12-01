import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';

import { CalendarDate, Event } from '@types';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss']
})
export class WeekViewComponent {
  @Input() canEdit = false;
  @Input() days: CalendarDate[] = [];
  @Input() current: moment.Moment = moment();

  @Output() deleteEvent = new EventEmitter<Event>();
  @Output() editEvent = new EventEmitter<Event>();
  @Output() weekForward = new EventEmitter();
  @Output() weekBackward = new EventEmitter();

  pMoment = moment;

  trackByIndex = (index: number) => index;

  nextWeek() {
    this.weekForward.emit();
  }

  previousWeek() {
    this.weekBackward.emit();
  }

  eventClicked(event: Event) {
    this.editEvent.emit(event);
  }

  deleteClicked(event: Event) {
    this.deleteEvent.emit(event);
  }
}
