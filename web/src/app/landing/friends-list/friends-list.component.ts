import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';

import { AddFriendDialogComponent } from '@dialogs/add-friend/add-friend.dialog';
import { DataService } from '@services/data.service';
import { Friend } from '@types';
import { EditFriendComponent } from '@dialogs/edit-friend/edit-friend.component';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss']
})
export class FriendsListComponent {
  friends: Observable<Friend[]>;

  constructor(private dialog: MatDialog, private ds: DataService) {
    this.ds.fetchFriends();
    this.friends = this.ds.friends;
  }

  addFriend() {
    this.dialog.open(AddFriendDialogComponent, {
      height: '420px',
      width: '500px',
    }).afterClosed().subscribe(id => {
      if (id) {
        this.ds.sendFriendRequest(id).subscribe();
      }
    });
  }

  editFriend(friend: Friend) {
    this.dialog.open(EditFriendComponent, {
      height: '300px',
      width: '500px',
      data: friend
    }).afterClosed().subscribe(value => {
      if (value) {
        this.ds.updateFriend(value).subscribe(() => this.ds.fetchFriends());
      }
    });
  }

  removeFriend(id: number) {
    this.ds.removeFriend(id).subscribe(() => this.ds.fetchFriends());
  }
}
