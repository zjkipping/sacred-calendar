import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable, forkJoin } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { CalendarDate, Event, CategoryFormValue } from '@types';
import { DIALOG_HEIGHT, DIALOG_WIDTH } from '@constants';
import { DataService } from '@services/data.service';
import { CalendarService } from '@services/calendar.service';
import { EventFormDialogComponent } from '@dialogs/event-form.dialog';
import { CategoryManagerDialogComponent } from '@dialogs/category-manager.dialog';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  sideNavOpen = false;

  constructor(private dialog: MatDialog, public ds: DataService, public cs: CalendarService) { }

  selectDate(date: CalendarDate) {
    this.sideNavOpen = !this.cs.selectDate(date);
  }

  closeSideNav() {
    this.sideNavOpen = false;
    this.cs.deselectDate();
  }

  addEvent() {
    this.dialog.open(EventFormDialogComponent, {
      height: DIALOG_HEIGHT,
      width: DIALOG_WIDTH
    }).afterClosed().subscribe(event => {
      if (event) {
        this.ds.newEvent(event).subscribe(() => this.ds.fetchEvents());
      }
    });
  }

  editEvent(event: Event) {
    this.dialog.open(EventFormDialogComponent, {
      height: DIALOG_HEIGHT,
      width: DIALOG_WIDTH,
      data: event
    }).afterClosed().subscribe(edited => {
      if (edited) {
        this.ds.updateEvent(edited).subscribe(() => this.ds.fetchEvents());
      }
    });
  }

  deleteEvent(event: Event) {
    this.ds.deleteEvent(event).subscribe(() => this.ds.fetchEvents());
  }

  manageCategories() {
    this.dialog.open(CategoryManagerDialogComponent, {
      height: DIALOG_HEIGHT,
      width: DIALOG_WIDTH,
      panelClass: 'category-dialog'
    }).afterClosed().subscribe((categories: CategoryFormValue[]) => {
      if (categories) {
        forkJoin(...categories.map(category => {
          if (category.new) {
            return this.ds.newCategory(category);
          } else if (category.delete) {
            return this.ds.deleteCategory(category);
          } else {
            return this.ds.updateCategory(category);
          }
        })).subscribe(_res => this.ds.fetchEvents());
      }
    });
  }
}
