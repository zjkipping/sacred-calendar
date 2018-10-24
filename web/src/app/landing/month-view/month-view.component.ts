import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss']
})
export class MonthViewComponent {
  @Input() events: Event[] = [];
  @Output() dateSelected = new EventEmitter<any>();

  testData: number[] = [];

  constructor() {
    for (let x = 1; x <= 42; x++) {
      this.testData.push(x);
    }
  }
}
