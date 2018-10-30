import { Component, Input, EventEmitter, Output } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';

import { CalendarDate } from '@types';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss'],
  /*
    Reference for animation:
     https://stackoverflow.com/questions/36417931/angular-2-ngif-and-css-transition-animation/36417971
  */
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({transform: 'translateX(100%)', opacity: 0}),
        animate('200ms', style({transform: 'translateX(0)', opacity: 1}))
      ]),
      transition(':leave', [
        style({transform: 'translateX(0)', opacity: 1}),
        animate('200ms', style({transform: 'translateX(100%)', opacity: 0}))
      ])
    ])
  ]
})
export class DayViewComponent {
  @Input() open?: boolean;
  @Input() day?: CalendarDate;
  @Output() close = new EventEmitter();
  @Output() deleteEvent = new EventEmitter<Event>();
  @Output() editEvent = new EventEmitter<Event>();
  @Output() newEvent = new EventEmitter();

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

  newClicked() {
    this.newEvent.emit();
  }
}
