import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AddFriendDialogComponent } from '@dialogs/add-friend/add-friend.dialog';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss']
})
export class FriendsListComponent {
  constructor(private dialog: MatDialog) { }

  addFriend() {
    this.dialog.open(AddFriendDialogComponent, {
      height: '420px',
      width: '500px',
    }).afterClosed().subscribe(id => {
      console.log(id);
    });
  }
}
