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
  name: string;
  description?: string;
  location?: string;
  date: moment.Moment;
  startTime: string;
  endTime?: string;
  category: Category;
}

export interface EventFormValue {
  name: string;
  date: Date;
  endTime: string;
  location: string;
  startTime: string;
  categoryID: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface CategoryFormValue {
  new: boolean;
  delete: boolean;
  id?: number;
  name: string;
  color: string;
}

export interface CalendarDate {
  events: Event[];
  // rename this, conflicts with type name too much
  mDate: moment.Moment;
  selected?: boolean;
  today?: boolean;
  disabled?: boolean;
}
