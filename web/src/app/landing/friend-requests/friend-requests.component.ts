import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DataService } from '@services/data.service';

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss']
})
export class FriendRequestsComponent {
  requests$ = new BehaviorSubject([] as any[]);

  constructor(private ds: DataService) {
    this.ds.getFriendRequests().subscribe(value => this.requests$.next(value));
  }

  acceptFriendRequest(id: number) {
    this.ds.acceptFriendRequest(id).subscribe(() => {
      this.ds.getFriendRequests().subscribe(value => this.requests$.next(value));
      this.ds.fetchFriends();
    });
  }

  denyFriendRequest(id: number) {
    this.ds.denyFriendRequest(id).subscribe(() => {
      this.ds.getFriendRequests().subscribe(value => this.requests$.next(value));
    });
  }
}
