import { Component } from '@angular/core';
import { CalendarDate } from '@types';
import { MatDialog } from '@angular/material';
import { EventFormDialogComponent } from '@dialogs/event-form.dialog';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  selectedDate?: CalendarDate;
  sideNavOpen = false;

  constructor(private dialog: MatDialog) { }

  selectDate(date: CalendarDate) {
    this.selectedDate = date;
    this.sideNavOpen = true;
  }

  addEvent() {
    this.dialog.open(EventFormDialogComponent, {
      height: '600px',
      width: '500px'
    }).afterClosed().subscribe(event => {
      // TODO: send this to the server
      console.log(event);
    });
  }
}
