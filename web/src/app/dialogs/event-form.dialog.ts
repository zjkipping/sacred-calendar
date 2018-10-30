import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Event, Category } from '@types';
import { Observable } from 'rxjs';
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
      date: [event ? event.date.toDate() : undefined, Validators.required],
      startTime: [event ? event.startTime : '', Validators.required],
      endTime: [event ? event.endTime : ''],
      categoryID: [category]
    });

    this.categories = ds.getCategories();
  }

  submitEvent() {
    // hack until I figure out how to have a null default selection option instead of ''
    return { ...this.eventForm.value, categoryID: this.eventForm.value.categoryID === '' ? null : this.eventForm.value.categoryID };
  }
}
