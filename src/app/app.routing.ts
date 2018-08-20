import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReservationCalendarComponent } from './components/reservation-calendar/reservation-calendar.component';
import { LoginFormComponent, HomeComponent, RegistrationFormComponent } from './components';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';

import { AuthGuard } from './guard/auth.guard';

const appRoutes: Routes = [
  { path: '', component: HomeComponent, data: { breadcrumb: 'Home'} },
  { path: 'login', component: LoginFormComponent, data: { breadcrumb: 'Login'} },
  { path: 'register', component: RegistrationFormComponent, data: { breadcrumb: 'Register'} },
  { path: 'home', component: HomeComponent, data: { breadcrumb: 'Home'}, canActivate: [AuthGuard] },
  { path: 'myAccount', component: UserDetailComponent, data: { breadcrumb: 'myAccount'}, canActivate: [AuthGuard] },
  { path: 'calendar', component: ReservationCalendarComponent, data: { breadcrumb: 'Calendar'}, canActivate: [AuthGuard] },
  { path: '**', component: PageNotFoundComponent, data: {breadcrumb: 'PageNotFound'}}

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {enableTracing: true});
