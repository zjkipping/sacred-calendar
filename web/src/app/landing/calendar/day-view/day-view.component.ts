import { Component, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material';

import { CalendarDate } from '@types';
import { EventFormDialogComponent } from '@dialogs/event-form.dialog';
import { DataService } from '@services/data.service';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent {
  @Input() day?: CalendarDate;
  @Output() close = new EventEmitter();
  @Output() deleteEvent = new EventEmitter<number>();

  constructor(private dialog: MatDialog, private ds: DataService) { }

  eventClicked(data: Event) {
    this.dialog.open(EventFormDialogComponent, {
      height: '600px',
      width: '500px',
      data
    }).afterClosed().subscribe(event => {
      if (event) {
        this.ds.newEvent(event);
      }
    });
  }

  closeClicked() {
    this.close.emit();
  }

  deleteClicked(index: number) {
    if (this.day) {
      this.ds.deleteEvent(this.day.events[index]).subscribe(
        () => {
          this.deleteEvent.emit(index);
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }
}
