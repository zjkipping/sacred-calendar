import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Event } from '@types';

@Component({
  selector: 'app-event-form-dialog',
  templateUrl: './event-form.dialog.html'
})
export class EventFormDialogComponent {
  eventForm: FormGroup;

  constructor(fb: FormBuilder, @Inject(MAT_DIALOG_DATA) event: Event) {
    this.eventForm = fb.group({
      name: [event ? event.name : '', Validators.required],
      description: [event ? event.description : ''],
      location: [event ? event.location : ''],
      date: [event ? event.date : undefined, Validators.required],
      startTime: [event ? event.startTime : '', Validators.required],
      endTime: [event ? event.endTime : '']
    });
  }
}
