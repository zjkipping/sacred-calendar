import { Component } from '@angular/core';

import { DataService } from '@services/data.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  requests: any[] = [];
  invites: any[] = [];
  tab = 'requests';

  constructor(private ds: DataService) {
    this.ds.getFriendRequests().subscribe(value => this.requests = value);
  }

  acceptFriendRequest(id: number) {
    this.ds.acceptFriendRequest(id).subscribe(() => {
      this.ds.getFriendRequests().subscribe(value => this.requests = value);
      this.ds.fetchFriends();
    });
  }

  denyFriendRequest(id: number) {
    this.ds.denyFriendRequest(id).subscribe(() => {
      this.ds.getFriendRequests().subscribe(value => this.requests = value);
    });
  }
}
