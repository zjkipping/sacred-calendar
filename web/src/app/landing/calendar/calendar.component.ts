import { Component, OnDestroy, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { forkJoin, of, Subscription } from 'rxjs';
import { switchMap, skip } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { CalendarDate, Event, CategoryFormValue, EventFormValue } from '@types';
import { DIALOG_HEIGHT, DIALOG_WIDTH } from '@constants';
import { DataService } from '@services/data.service';
import { CalendarService } from '@services/calendar.service';
import { EventFormDialogComponent } from '@dialogs/event-form/event-form.dialog';
import { CategoryManagerDialogComponent } from '@dialogs/category-manager/category-manager.dialog';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnDestroy {
  sideNavOpen = false;
  viewingFriend = false;
  queryParamsSubscription: Subscription;
  calendarViewSubscription: Subscription;
  calendarView: FormControl;
  calendarMenuOpen = false;
  displayCalendarMenu = false;
  belowThreshold = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth > 600) {
      this.calendarMenuOpen = true;
      this.displayCalendarMenu = false;
    } else {
      if (!this.displayCalendarMenu) {
        this.calendarMenuOpen = false;
      }
      this.displayCalendarMenu = true;
    }

    if (event.target.innerWidth < 720 && !this.belowThreshold) {
      this.belowThreshold = true;
      this.calendarView.setValue('weekly');
      this.calendarView.disable();
    } else if (event.target.innerWidth >= 720 && this.belowThreshold) {
      this.belowThreshold = false;
      this.calendarView.enable();
    }
  }

  constructor(
    private dialog: MatDialog,
    public ds: DataService,
    public cs: CalendarService,
    route: ActivatedRoute,
    private router: Router,
    fb: FormBuilder
  ) {
    this.queryParamsSubscription = route.queryParams.pipe(skip(1)).subscribe(params => {
    const friendship_id = params['view_friend'];
      if (friendship_id) {
        this.viewingFriend = true;
      } else {
        this.viewingFriend = false;
      }
      this.ds.loadingEvents = true;
      this.ds.fetchEvents();
    });
    this.calendarView = fb.control(this.cs.view.value);
    this.calendarViewSubscription = this.calendarView.valueChanges.subscribe(value => {
      if (value === 'weekly') {
        this.closeSideNav();
      }
      this.cs.setView(value);
    });

    this.belowThreshold = window.innerWidth < 720;
    if (this.belowThreshold) {
      this.calendarView.disable();
    }

    if (window.innerWidth > 600) {
      this.calendarMenuOpen = true;
      this.displayCalendarMenu = false;
    } else {
      if (!this.displayCalendarMenu) {
        this.calendarMenuOpen = false;
      }
      this.displayCalendarMenu = true;
    }

  }

  ngOnDestroy() {
    this.queryParamsSubscription.unsubscribe();
    this.calendarViewSubscription.unsubscribe();
  }

  viewMyCalendar() {
    this.router.navigate(['/calendar']);
  }

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
    }).afterClosed().subscribe((event: EventFormValue) => {
      if (event) {
        this.ds.newEvent(event).pipe(
          switchMap((id: number) => {
            if (event.invites && event.invites.length > 0) {
              return this.ds.sendEventInvites(id, event.invites);
            } else {
              return of({});
            }
          })
        ).subscribe(() => this.ds.fetchEvents());
      }
    });
  }

  editEvent(event: Event) {
    this.dialog.open(EventFormDialogComponent, {
      height: DIALOG_HEIGHT,
      width: DIALOG_WIDTH,
      data: event
    }).afterClosed().subscribe((edited: EventFormValue) => {
      if (edited) {
        this.ds.updateEvent(edited).pipe(
          switchMap(() => {
            if (edited.invites && edited.invites.length > 0) {
              return this.ds.sendEventInvites(event.id, edited.invites);
            } else {
              return of({});
            }
          })
        ).subscribe(() => this.ds.fetchEvents());
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
