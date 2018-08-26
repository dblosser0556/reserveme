import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserService, AuthService, FacilityService, ResourceService, ReservationService } from '../../services';
import {
  ReservationCalendarComponent, ResourceTabsComponent, ResourceCalendarComponent,
  EditReservationDialogComponent
} from '.';
import { CalendarModule } from 'angular-calendar';



@NgModule({
  declarations: [
    ReservationCalendarComponent,
    ResourceTabsComponent,
    ResourceCalendarComponent,
    EditReservationDialogComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    ClarityModule,
    ClrFormsNextModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot()
  ],
  exports: [
    ReservationCalendarComponent
  ],

  providers: [UserService, AuthService, FacilityService, ResourceService, ReservationService],
})
export class ReservationCalendarModule { }
