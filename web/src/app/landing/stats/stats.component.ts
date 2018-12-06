import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

import * as moment from 'moment';
import { DataService } from '@services/data.service';
import { Statistic } from '@types';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class StatsComponent {
  date = new FormControl(moment());
  loadingStats = true;
  chartLabels: string[] = [];
  chartData: number[] = [];
  chartColors: any[] = [{ backgroundColor: [] }];
  totalHours = 0;

  chartOptions = {
    tooltips: {
      callbacks: {
        label: (options: any, data: any) => {
          return `${data.datasets[options.datasetIndex].data[options.index]} Hours`;
        }
      }
    }
  };

  constructor(private ds: DataService) {
    this.updateStats();
  }

  chosenYearHandler(normalizedYear: moment.Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(normlizedMonth: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normlizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
    this.updateStats();
  }

  updateStats() {
    this.loadingStats = true;
    this.ds.getStats(this.date.value).subscribe((stats: Statistic[]) => {
      this.chartLabels = stats.map(stat => stat.name);
      this.chartColors = [{ backgroundColor: stats.map(stat => stat.color) }];
      this.chartData = stats.map(stat => Number((stat.minutes / 60).toFixed(2)));
      if (stats.length > 0) {
        this.totalHours = this.chartData.reduce((prev, current) => prev + current);
      } else {
        this.totalHours = 0;
      }
      this.loadingStats = false;
    });
  }
}
