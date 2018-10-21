import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { LoggedInGuardService } from '@services/logged-in-guard.service';
import { AuthGuardService } from '@services/auth-guard.service';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoggedInGuardService] },
  { path: 'register', component: RegisterComponent, canActivate: [LoggedInGuardService] },
  { path: '', loadChildren: './landing/landing.module#LandingModule', canActivate: [AuthGuardService] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
