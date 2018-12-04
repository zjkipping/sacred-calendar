import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog, MatMenuTrigger } from '@angular/material';

import { DataService } from '@services/data.service';
import { EventInvite } from '@types';
import { ViewEventDialogComponent } from '@dialogs/view-event/view-event.dialog';
import { DIALOG_WIDTH, DIALOG_HEIGHT } from '@constants';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnDestroy {
  @ViewChild(MatMenuTrigger) trigger?: MatMenuTrigger;
  requests: any[] = [];
  invites: any[] = [];
  tab = 'requests';

  invitesSubscription: Subscription;
  requestsSubscription: Subscription;

  constructor(private ds: DataService, private dialog: MatDialog) {
    this.invitesSubscription = this.ds.eventInvites.subscribe(value => this.invites = value);
    this.requestsSubscription = this.ds.friendRequests.subscribe(value => this.requests = value);
  }

  ngOnDestroy() {
    this.invitesSubscription.unsubscribe();
    this.requestsSubscription.unsubscribe();
  }

  acceptFriendRequest(id: number) {
    this.ds.acceptFriendRequest(id).subscribe(() => {
      this.ds.fetchFriendRequests();
      this.ds.fetchFriends();
    });
  }

  denyFriendRequest(id: number) {
    this.ds.denyFriendRequest(id).subscribe(() => this.ds.fetchFriendRequests());
  }

  viewEventInvite(invite: EventInvite) {
    this.dialog.open(ViewEventDialogComponent, {
      height: DIALOG_HEIGHT,
      width: DIALOG_WIDTH,
      data: invite,
      panelClass: 'category-dialog'
    }).afterClosed().subscribe((result: { choice: boolean }) => {
      if (result) {
        if (result.choice) {
          this.ds.acceptEventInvite(invite.id).subscribe(() => {
            this.ds.fetchEventInvites();
            this.ds.fetchEvents();
          });
        } else {
          this.denyEventInvite(invite.id);
        }
      }
    });
  }

  denyEventInvite(id: number) {
    this.ds.denyEventInvite(id).subscribe(() => this.ds.fetchEventInvites());
  }

  closeMenu() {
    if (this.trigger) {
      this.trigger.closeMenu();
    }
  }
}
