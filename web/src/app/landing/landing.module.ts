
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaterialModule } from '../material.module';
import { LandingRoutingModule } from './landing-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { LandingComponent } from './landing.component';
import { CalendarComponent } from './calendar/calendar.component';
import { StatsComponent } from './stats/stats.component';
import { AvailabilityComponent } from './availability/availability.component';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    NavbarComponent,
    LandingComponent,
    CalendarComponent,
    StatsComponent,
    AvailabilityComponent,
    ProfileComponent,
    FriendsListComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
