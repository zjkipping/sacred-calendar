
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaterialModule } from '../material.module';
import { LandingRoutingModule } from './landing-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { LandingComponent } from './landing.component';
import { CalendarComponent } from './calendar/calendar.component';
import { StatsComponent } from './stats/stats.component';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { ProfileComponent } from './profile/profile.component';
import { MonthViewComponent } from './month-view/month-view.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DayViewComponent } from './calendar/day-view/day-view.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    NavbarComponent,
    LandingComponent,
    CalendarComponent,
    StatsComponent,
    ProfileComponent,
    FriendsListComponent,
    NotificationsComponent,
    MonthViewComponent,
    DayViewComponent
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
