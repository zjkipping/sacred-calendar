import { Component, Inject } from '@angular/core';

import { EventInvite } from '@types';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-view-event-dialog',
  templateUrl: './view-event.dialog.html',
  styleUrls: ['./view-event.dialog.scss']
})
export class ViewEventDialogComponent {
  invite: EventInvite;

  constructor(@Inject(MAT_DIALOG_DATA) inviteData: EventInvite) {
    this.invite = inviteData;
  }
}
