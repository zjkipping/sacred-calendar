import { Component, Inject } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { Notification, EventFormValue } from '@types';
import { DataService, convertTimeToMomentDate } from '@services/data.service';

@Component({
  selector: 'app-invite-available-friends-dialog',
  templateUrl: './invite-available-friends.dialog.html',
  styleUrls: ['./invite-available-friends.dialog.scss']
})
export class InviteAvailableFriendsComponent {
  invitesControl: FormControl;
  availableFriends: Observable<Notification[]>;
  startTime: moment.Moment;
  endTime?: moment.Moment;

  constructor(fb: FormBuilder, @Inject(MAT_DIALOG_DATA) data: {event: EventFormValue, invites: Notification[]}, ds: DataService) {
    this.invitesControl = fb.control(data.invites, Validators.required);
    this.availableFriends = ds.getAvailableFriends(data.event);

    const date = moment(data.event.date);
    this.startTime = convertTimeToMomentDate(data.event.startTime, date);
    this.endTime = data.event.endTime ? convertTimeToMomentDate(data.event.endTime, date) : undefined;
  }
}
