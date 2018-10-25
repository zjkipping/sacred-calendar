import { Component, Input } from '@angular/core';

import { CalendarDate } from '@types';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent {
  @Input() day?: CalendarDate;
}
