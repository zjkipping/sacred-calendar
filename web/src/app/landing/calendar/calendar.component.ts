import { Component } from '@angular/core';
import { CalendarDate } from '@types';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  selectedDate?: CalendarDate;

  selectDate(date: CalendarDate) {
    this.selectedDate = date;
  }
}
