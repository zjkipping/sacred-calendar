import { Component, Input, EventEmitter, Output } from '@angular/core';

import { CalendarDate } from '@types';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent {
  @Input() day?: CalendarDate;
  @Output() close = new EventEmitter();
  @Output() deleteEvent = new EventEmitter<Event>();
  @Output() editEvent = new EventEmitter<Event>();

  constructor() { }

  eventClicked(event: Event) {
    this.editEvent.emit(event);
  }

  closeClicked() {
    this.close.emit();
  }

  deleteClicked(event: Event) {
    this.deleteEvent.emit(event);
  }
}
