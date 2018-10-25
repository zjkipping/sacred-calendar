import * as moment from 'moment';

export interface UserDetails {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  signUpDate: number;
}

export interface Event {
  id: number;
}

export interface CalendarDate {
  events: Event[];
  // rename this, conflicts with type name too much
  mDate: moment.Moment;
  selected?: boolean;
  today?: boolean;
  disabled?: boolean;
}
