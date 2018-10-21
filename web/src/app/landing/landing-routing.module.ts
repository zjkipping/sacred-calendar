import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { CalendarComponent } from './calendar/calendar.component';
import { StatsComponent } from './stats/stats.component';
import { AvailabilityComponent } from './availability/availability.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    children: [
      { path: 'calendar', component: CalendarComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'availability', component: AvailabilityComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '**', redirectTo: 'calendar' }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
