import { Component, Output, EventEmitter, Input } from '@angular/core';

import { Event } from '@types';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent {
  @Input() events: Event[] = [];

  @Output() selected = new EventEmitter<Event>();
  @Output() delete = new EventEmitter<Event>();
}
