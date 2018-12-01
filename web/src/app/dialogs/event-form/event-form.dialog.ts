import { Component, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material';
import { Observable, merge, Subscription } from 'rxjs';
import * as moment from 'moment';

import { Event, Category, Notification } from '@types';
import { DataService, convertTimeToMomentDate } from '@services/data.service';
import { InviteAvailableFriendsComponent } from '@dialogs/invite-available-friends/invite-available-friends.dialog';

class EndTimeValidationErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.dirty && form && form.hasError('endTimeBeforeStart'));
  }
}

@Component({
  selector: 'app-event-form-dialog',
  templateUrl: './event-form.dialog.html',
  styleUrls: ['./event-form.dialog.scss']
})
export class EventFormDialogComponent implements OnDestroy {
  eventForm: FormGroup;
  categories: Observable<Category[]>;
  invites: Notification[] = [];
  timeChangeSubscription: Subscription;

  endTimeValidation = new EndTimeValidationErrorMatcher();

  constructor(fb: FormBuilder, @Inject(MAT_DIALOG_DATA) event: Event, ds: DataService, private dialog: MatDialog) {
    let category: any = '';
    if (event && event.category && event.category.id) {
      category = event.category.id;
    }

    this.eventForm = fb.group({
      id: [event ? event.id : undefined],
      name: [event ? event.name : '', Validators.required],
      description: [event ? event.description : ''],
      location: [event ? event.location : ''],
      date: [event ? event.date.toDate() : moment().toDate(), Validators.required],
      startTime: [event ? event.startTime.format('hh:mm a') : '', Validators.required],
      endTime: [event && event.endTime ? event.endTime.format('hh:mm a') : ''],
      categoryID: [category]
    }, {
      validator: this.endTimeValidator
    });

    this.categories = ds.getCategories();

    this.timeChangeSubscription = merge([
      (this.eventForm.get('startTime') as FormControl).valueChanges,
      (this.eventForm.get('endTime') as FormControl).valueChanges
    ]).subscribe(() => {
      this.invites = [];
    });
  }

  ngOnDestroy() {
    this.timeChangeSubscription.unsubscribe();
  }

  inviteFriends() {
    this.dialog.open(InviteAvailableFriendsComponent, {
      data: { event: this.eventForm.value, invites: this.invites },
      height: '300px',
      width: '500px',
    }).afterClosed().subscribe((invites: Notification[]) => this.invites = (invites ? invites : []));
  }

  submitEvent() {
    return {
      ...this.eventForm.value,
      invites: this.invites,
      // hack until I figure out how to have a null default selection option instead of ''
      categoryID: this.eventForm.value.categoryID === '' ? undefined : this.eventForm.value.categoryID
    };
  }

  endTimeValidator(form: FormGroup) {
    const start = (form.get('startTime') as FormControl);
    const end = (form.get('endTime') as FormControl);
    if (start.value !== '' && end.value !== '') {
      const startUnix = convertTimeToMomentDate(start.value, moment());
      const endUnix = convertTimeToMomentDate(end.value, moment());
      return startUnix > endUnix ? { endTimeBeforeStart: true } : null;
    } else {
      return null;
    }
  }
}
