import { TestBed } from '@angular/core/testing';
import * as moment from 'moment';

import { GenerateDates } from './calendar.service';
import { UnitTestEvents, UnitTestDates } from '../../assets/unit-test-data';
import { CalendarDate } from '@types';

describe('CalendarService', () => {
  let days: CalendarDate[] = [];

  beforeEach(() => TestBed.configureTestingModule({}));
  beforeAll(() => days = GenerateDates(UnitTestEvents, moment('2018-11-01', 'YYYY-MM-DD'), undefined));

  it('should generate 42 days', () => {
    expect(days.length).toEqual(42);
  });

  it('should put the events on the correct days', () => {
    const mapped_test_data = UnitTestDates.map(day => ({ ...day, mDate: day.mDate.format('YYYY-MM-DD') }));
    const mapped_days = days.map(day => ({ ...day, mDate: day.mDate.format('YYYY-MM-DD') }));
    expect(mapped_days).toEqual(mapped_test_data);
  });
});
