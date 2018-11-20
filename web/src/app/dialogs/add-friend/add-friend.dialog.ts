import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { BehaviorSubject, of } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { DataService } from '@services/data.service';
import { FriendRequestOption } from '@types';

@Component({
  selector: 'app-add-friend-dialog',
  templateUrl: './add-friend.dialog.html',
  styleUrls: ['./add-friend.dialog.scss']
})
export class AddFriendDialogComponent {
  friendControl: FormControl;
  friendOptions = new BehaviorSubject([] as FriendRequestOption[]);
  selectedOption?: FriendRequestOption;

  constructor(fb: FormBuilder, ds: DataService, private ref: MatDialogRef<AddFriendDialogComponent>) {
    this.friendControl = fb.control('', Validators.required);

    this.friendControl.valueChanges.pipe(
      debounceTime(200),
      switchMap(username => {
        if (username !== '') {
          return ds.getFriendTypeAhead(username);
        } else {
          return of([]);
        }
      }),
      tap(options => console.log(options))
    ).subscribe((options: FriendRequestOption[]) => this.friendOptions.next(options));
  }

  selectUser(option: FriendRequestOption) {
    this.friendControl.setValue(option.username, { emitEvent: false, emitModelToViewChange: true });
    this.selectedOption = option;
    this.friendOptions.next([]);
  }

  sendRequest() {
    if (this.selectedOption) {
      this.ref.close(this.selectedOption.id);
    }
  }
}
