import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';

import { CalendarDate, Event, CategoryFormValue } from '@types';
import { EventFormDialogComponent } from '@dialogs/event-form.dialog';
import { DataService } from '@services/data.service';
import { CategoryManagerDialogComponent } from '@dialogs/category-manager.dialog';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  selectedDate?: CalendarDate;
  sideNavOpen = false;
  events: Observable<Event[]>;

  constructor(private dialog: MatDialog, private ds: DataService) {
    this.events = this.ds.getEvents();
  }

  selectDate(date: CalendarDate) {
    if (this.selectedDate && date.mDate.isSame(this.selectedDate.mDate, 'day')) {
      this.closeSideNav();
    } else {
      this.selectedDate = date;
      this.sideNavOpen = true;
    }
  }

  addEvent() {
    this.dialog.open(EventFormDialogComponent, {
      height: '600px',
      width: '500px'
    }).afterClosed().subscribe(event => {
      if (event) {
        this.ds.newEvent(event);
      }
    });
  }

  manageCategories() {
    this.dialog.open(CategoryManagerDialogComponent, {
      height: '600px',
      width: '500px',
      panelClass: 'category-dialog'
    }).afterClosed().subscribe((categories: CategoryFormValue[]) => {
      if (categories) {
        categories.forEach(category => {
          if (category.new) {
            this.ds.newCategory(category);
          } else if (category.delete) {
            this.ds.deleteCategory(category);
          } else {
            this.ds.updateCategory(category);
          }
        });
      }
    });
  }

  eventDeleted(index: number) {
    if (this.selectedDate) {
      this.selectedDate.events.splice(index, 1);
      // refetch events?
    }
  }

  closeSideNav() {
    this.sideNavOpen = false;
    this.selectedDate = undefined;
  }
}
