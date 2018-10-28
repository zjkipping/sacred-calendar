import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EventFormDialogComponent } from '@dialogs/event-form.dialog';
import { MaterialModule } from '../material.module';
import { CategoryManagerDialogComponent } from './category-manager.dialog';

@NgModule({
  declarations: [
    EventFormDialogComponent,
    CategoryManagerDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    EventFormDialogComponent,
    CategoryManagerDialogComponent
  ]
})
export class DialogModule { }
