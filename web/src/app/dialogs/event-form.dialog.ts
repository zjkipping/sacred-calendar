import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { Event, Category } from '@types';
import { DataService } from '@services/data.service';

@Component({
  selector: 'app-event-form-dialog',
  templateUrl: './event-form.dialog.html',
  styles: [`
    .description {
      resize: vertical;
      max-height: 200px;
      min-height: 100px;
    }
    .event-form-body {
      height: 450px;
      overflow-y: auto;
    }
  `]
})
export class EventFormDialogComponent {
  eventForm: FormGroup;
  categories: Observable<Category[]>;

  constructor(fb: FormBuilder, @Inject(MAT_DIALOG_DATA) event: Event, ds: DataService) {
    let category: any = '';
    if (event && event.category && event.category.id) {
      category = event.category.id;
    }

    this.eventForm = fb.group({
      id: [event ? event.id : undefined],
      name: [event ? event.name : '', Validators.required],
      description: [event ? event.description : ''],
      location: [event ? event.location : ''],
      date: [event ? event.date.toDate() : moment().toDate(), Validators.required],
      startTime: [event ? event.startTime.format('hh:mm a') : '', Validators.required],
      endTime: [event && event.endTime ? event.endTime.format('hh:mm a') : ''],
      categoryID: [category]
    });

    this.categories = ds.getCategories();
  }

  submitEvent() {
    // hack until I figure out how to have a null default selection option instead of ''
    return { ...this.eventForm.value, categoryID: this.eventForm.value.categoryID === '' ? undefined : this.eventForm.value.categoryID };
  }
}
