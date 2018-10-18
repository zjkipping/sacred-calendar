import { NgModule } from '@angular/core';

import { NewEventDialogComponent } from '@dialogs/new-event.dialog';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    NewEventDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  entryComponents: [
    NewEventDialogComponent
  ]
})
export class DialogModule { }
