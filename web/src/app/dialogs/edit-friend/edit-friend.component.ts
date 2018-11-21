import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

import { Friend } from '@types';

@Component({
  selector: 'app-edit-friend',
  templateUrl: './edit-friend.component.html',
  styleUrls: ['./edit-friend.component.scss']
})
export class EditFriendComponent {
  friendForm: FormGroup;

  constructor(fb: FormBuilder, @Inject(MAT_DIALOG_DATA) friend: Friend) {
    this.friendForm = fb.group({
      id: [friend.id],
      tag: [friend.tag],
      privacyType: [friend.privacyType]
    });
  }
}
