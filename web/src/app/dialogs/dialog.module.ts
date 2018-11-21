import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';

import { EventFormDialogComponent } from '@dialogs/event-form/event-form.dialog';
import { MaterialModule } from '../material.module';
import { CategoryManagerDialogComponent } from './category-manager/category-manager.dialog';
import { AddFriendDialogComponent } from './add-friend/add-friend.dialog';
import { EditFriendComponent } from './edit-friend/edit-friend.component';

@NgModule({
  declarations: [
    EventFormDialogComponent,
    CategoryManagerDialogComponent,
    AddFriendDialogComponent,
    EditFriendComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    ColorPickerModule
  ],
  entryComponents: [
    EventFormDialogComponent,
    CategoryManagerDialogComponent,
    AddFriendDialogComponent,
    EditFriendComponent
  ]
})
export class DialogModule { }
