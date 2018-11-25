
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '../material.module';
import { LandingRoutingModule } from './landing-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { LandingComponent } from './landing.component';
import { CalendarComponent } from './calendar/calendar.component';
import { MonthViewComponent } from './calendar/month-view/month-view.component';
import { DayViewComponent } from './calendar/day-view/day-view.component';
import { WeekViewComponent } from './calendar//week-view/week-view.component';
import { EventListComponent } from './calendar/event-list/event-list.component';
import { StatsComponent } from './stats/stats.component';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { NotificationsComponent } from './notifications/notifications.component';

@NgModule({
  declarations: [
    NavbarComponent,
    LandingComponent,
    CalendarComponent,
    StatsComponent,
    FriendsListComponent,
    NotificationsComponent,
    MonthViewComponent,
    WeekViewComponent,
    DayViewComponent,
    EventListComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    LandingRoutingModule,
    ReactiveFormsModule,
    FlexLayoutModule
  ]
})
export class LandingModule { }
