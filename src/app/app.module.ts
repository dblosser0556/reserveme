import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { QuillModule } from 'ngx-quill';
import { AppComponent } from './components/app/app.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessagesComponent } from './components/messages/messages.component';
import { HomeComponent, LoginFormComponent, HeaderComponent } from './components';
import { routing } from './app.routing';
import { UserService, AuthService, FacilityService, ResourceService, ReservationService } from './services';
import { AuthGuard} from './guard/auth.guard';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ReservationCalendarModule } from './components/reservation-calendar/reservation-calendar.module';
import { JwtModule} from '@auth0/angular-jwt';
import { RegistrationFormComponent } from './components/registration-form/registration-form.component';
import { ConfigurationModule } from './components/configuration/configuration.module';
import { ToastrModule } from 'ngx-toastr';
import { UserDetailModule } from './components/user-detail/user-detail.module';
import { MailerModule } from './components/mailer/mailer.module';



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
    RegistrationFormComponent,


  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    ClarityModule,
    ClrFormsNextModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ReservationCalendarModule,
    ConfigurationModule,
    UserDetailModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    QuillModule,
    MailerModule,
    routing,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:4000'],
        blacklistedRoutes: ['localhost:4000/api/auth']
    }})
  ],
  providers: [UserService, AuthService, AuthGuard, FacilityService, ResourceService, ReservationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
