
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaterialModule } from '../material.module';
import { LandingRoutingModule } from './landing-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { LandingComponent } from './landing.component';

@NgModule({
  declarations: [
    NavbarComponent,
    LandingComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
