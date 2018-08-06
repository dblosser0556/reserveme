import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './components/app/app.component';
import { ClarityModule } from '@clr/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessagesComponent } from './components/messages/messages.component';
import { HomeComponent, LoginFormComponent, HeaderComponent } from './components';
import { routing } from './app.routing';
import { MemberService, AuthService, FacilityService, ResourceService, ReservationService } from './services';
import { AuthGuard} from './guard/auth.guard';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CalendarHeaderComponent } from './components/calendar-header/calendar-header.component';
import { ResourceTabsComponent } from './components/resource-tabs/resource-tabs.component';
import { ResourceCalendarComponent } from './components/resource-calendar/resource-calendar.component';
import { CalendarModule } from 'angular-calendar';
import { JwtModule} from '@auth0/angular-jwt';
import { EditReservationDialogComponent } from './components/edit-reservation-dialog/edit-reservation-dialog.component';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent,
    MessagesComponent,
    HomeComponent,
    LoginFormComponent,
    HeaderComponent,
    PageNotFoundComponent,
    CalendarHeaderComponent,
    ResourceTabsComponent,
    ResourceCalendarComponent,
    EditReservationDialogComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    ClarityModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot(),
    routing,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:4000'],
        blacklistedRoutes: ['localhost:4000/api/auth']
    }})
  ],
  providers: [MemberService, AuthService, AuthGuard, FacilityService, ResourceService, ReservationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
