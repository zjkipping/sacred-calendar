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
  created: number;
  description?: string;
  location?: string;
  date: moment.Moment;
  startTime: moment.Moment;
  endTime?: moment.Moment;
  category: Category;
  fontColor?: string;
}

export interface EventFormValue {
  id: number;
  name: string;
  description: string;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  categoryID: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  fontColor?: string;
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

export interface Friend {
  id: number;
  username: string;
  privacyType: number;
  tag?: string;
}

export interface FriendRequestOption {
  id: number;
  username: string;
}
