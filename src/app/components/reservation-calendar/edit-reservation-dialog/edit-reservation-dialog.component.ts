import { Component, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { Reservation, Resource, Facility } from '../../../models';
import { AutofocusDirective } from '../../../directives/autofocus.directive';
import { CalendarEvent } from 'angular-calendar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ReservationService, AuthService } from '../../../services';
import { Observable } from 'rxjs';

export interface DetailsData {
  action: string;
  memberName: string;
  facility: Facility;
  resource: Resource;
  event: CalendarEvent;
}

@Component({
  selector: 'app-edit-reservation-dialog',
  templateUrl: './edit-reservation-dialog.component.html',
  styleUrls: ['./edit-reservation-dialog.component.scss']
})
export class EditReservationDialogComponent implements OnChanges {
  @ViewChild(AutofocusDirective) autofocus: AutofocusDirective;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onOK: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();

  eventForm: FormGroup;
  show = false;

  // handle recurring features
  canRecur = false;
  showRecurring = false;
  pattern = 'weekly';
  daily = 'dailyEvery';
  monthly = 'monthByDay';

  event: CalendarEvent;
  action: string;
  memberName: string;
  resource: Resource = null;
  facility: Facility = null;
  canEdit = false;
  availableStartTimes: Observable<string[]>;
  availableEndTimes: Observable<string[]>;
  availableDays: string[];
  maxDate: Date;
  maxReservationsPerDay: number;

  constructor(private fb: FormBuilder, private resService: ReservationService, private auth: AuthService) {
    this.createForm();
  }

  ngOnChanges() {
    const startTime = moment(this.event.start).format('LT');
    const endTime = moment(this.event.end).format('LT');
    const date = moment(this.event.start).format('YYYY-MM-DD');
    this.eventForm.reset({
      id: this.event.id,
      title: this.event.title,
      eventDate: date,
      startTime: startTime,
      endTime: endTime
    });
  }

  async open(detailsData: DetailsData) {


    this.event = detailsData.event;
    this.memberName = detailsData.memberName;
    this.action = detailsData.action;

    // only allow editing the form if type edited.
    if (this.action === 'Edit' || this.action === 'Create') {
      this.canEdit = true;
      this.canRecur = this.auth.userRole.isAdmin;
    } else {
      this.canEdit = false;
    }
    this.facility = detailsData.facility;
    this.resource = detailsData.resource;
    this.maxDate = moment().add(this.auth.userRole.maxReservationPeriod, 'days').toDate();
    this.maxReservationsPerDay = this.auth.userRole.maxReservationsPerDay;

    // this.getAvailableStartTimes();  // start here
    this.availableStartTimes = await this.resService.getAvailableStartTimes(this.event,
      this.resource, this.facility, this.event.start);
    this.availableEndTimes = await this.resService.getAvailableEndTimes(this.event,
      this.resource, this.facility, this.event.start);
    if (this.auth.userRole.maxReservationPeriod <= 14) {
      this.availableDays = this.getAvailableDays(this.event);
    }


    this.ngOnChanges();
    this.show = true;

    setTimeout(() => {
      if (this.autofocus) {
        this.autofocus.setFocus();
      }
    }, 0.1);

  }

  close() {
    this.show = false;
  }

  onKeyPress(event) {
    if (event.keyCode === 13) {
      const _event = this.getEventFromFormValue(this.eventForm);
      this.onOK.emit(_event);
    }
  }

  onSubmit() {
    const event = this.getEventFromFormValue(this.eventForm.getRawValue());
    this.onOK.emit(event);
  }

  // update the event title based on the user and times.
  updateTitle(event$: Event): void {
    const title = this.memberName + ' ' + this.startTime.value + ' ' + this.endTime.value;
    this.title.setValue(title);
  }


  createForm() {
    this.eventForm = this.fb.group({
      id: '',
      title: [''],
      eventDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  get title() {
    return this.eventForm.get('title');
  }
  get eventDate() {
    return this.eventForm.get('eventDate');
  }

  get startTime() {
    return this.eventForm.get('startTime');
  }

  get endTime() {
    return this.eventForm.get('endTime');
  }


  getEventFromFormValue(formValue: any): CalendarEvent {
    const startTime = formValue.eventDate + ' ' + formValue.startTime;
    const endTime = formValue.eventDate + ' ' + formValue.endTime;

    const event = {
      id: formValue.id,
      title: formValue.title,
      start: moment(startTime).toDate(),
      end: moment(endTime).toDate()
    };
    return event;
  }

  async getAvailableStartTimes(event$: any) {
    const startDateTime = this.eventDate.value + ' ' + event$.target.value;
    this.availableStartTimes = await this.resService.getAvailableStartTimes(this.event,
      this.resource, this.facility, moment(startDateTime).toDate());

  }

  async getAvailableEndTimes(event$: any) {
    const endDateTime = this.eventDate.value + ' ' + event$.target.value;
    this.availableEndTimes = await this.resService.getAvailableEndTimes(this.event,
      this.resource, this.facility, moment(endDateTime).toDate());
  }

  getAvailableDays(event$: any) {
    const availableDays = new Array<string>();
    for (let i = 0;  i < this.auth.userRole.maxReservationPeriod; i++) {
      // make sure the current user has less than the maximimum reservations per day
      let found = 0;
      const date = moment().add(i, 'days');
      for (const reservation of this.auth.reservations) {
        if (date.isSame(reservation.startDateTime, 'day') && reservation.id !== event$.id) {
          found++;
        }
      }
      if (found < this.maxReservationsPerDay) {
        availableDays.push(date.format('YYYY-MM-DD'));
      }
    }
    return availableDays;
  }

 
}


