import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EventFormDialogComponent } from '@dialogs/event-form.dialog';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [
    EventFormDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    EventFormDialogComponent
  ]
})
export class DialogModule { }
