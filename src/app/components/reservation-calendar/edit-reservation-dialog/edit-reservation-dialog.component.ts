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
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onDelete: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();
  eventForm: FormGroup;
  show = false;

  // handle recurring features
  canRecur = false;
  showRecurring = false;
  pattern = 'weekly';
  daily = 'dailyEvery';
  monthly = 'monthByDay';
  range = 'endBy';

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

  // need to be added to facility
  facilityMaxReservationDays = 185;
  facilityDefaultOccurnaces = 10;


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
    this.setDaily(this.event.start);
    this.setWeekly(this.event.start);
    this.setMonthly(this.event.start);
    this.setRange(this.event.start, this.facilityDefaultOccurnaces);

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
    this.show = false;
  }

  onRemove() {
    const event = this.getEventFromFormValue(this.eventForm.getRawValue());
    this.onDelete.emit(event);
    this.show = false;
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
      endTime: ['', Validators.required],

      // add the recurring options
      pattern: '',
      dailyEvery: '',
      dailyEveryDays: '1',
      dailyWeekDays: '',
      weeklyWeeks: '1',
      weeklySunday: '',
      weeklyMonday: '',
      weeklyTuesday: '',
      weeklyWednesday: '',
      weeklyThursday: '',
      weeklyFriday: '',
      weeklySaturday: '',
      monthlyByDay: '',
      monthlyDay: '',
      monthlyNoMonths: '',
      monthlyByWeekDay: '',
      monthlyWeekOfMonth: '',
      monthlyDayOfWeek: '',
      monthlyEveryNoMonths: '',
      range: '',
      rangeEndByDate: '',
      rangeEndAfterNo: ''
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

  dateChangeHandler(event$: any) {
    this.getAvailableStartTimes(event$);
    this.setDaily(event$.target.value);
    this.setWeekly(event$.target.value);
    this.setMonthly(event$.target.value);
    this.setRange(event$.target.value, this.facilityDefaultOccurnaces);
  }

  setDaily(event$: any) {
    this.eventForm.get('dailyEveryDays').setValue(1);
  }

  setWeekly(event$: any) {
    this.eventForm.get('weeklySunday').setValue(0);
    this.eventForm.get('weeklyMonday').setValue(0);
    this.eventForm.get('weeklyTuesday').setValue(0);
    this.eventForm.get('weeklyWednesday').setValue(0);
    this.eventForm.get('weeklyThursday').setValue(0);
    this.eventForm.get('weeklyFriday').setValue(0);
    this.eventForm.get('weeklySaturday').setValue(0);

    this.eventForm.get('weeklyWeeks').setValue(1);
    const weekDay = moment(event$).weekday();
    switch (weekDay) {
      case 0:
        this.eventForm.get('weeklySunday').setValue(1);
        return;
      case 1:
        this.eventForm.get('weeklyMonday').setValue(1);
        return;
      case 2:
        this.eventForm.get('weeklyTuesday').setValue(1);
        return;
      case 3:
        this.eventForm.get('weeklyWednesday').setValue(1);
        return;
      case 4:
        this.eventForm.get('weeklyThursday').setValue(1);
        return;
      case 5:
        this.eventForm.get('weeklyFriday').setValue(1);
        return;
      case 6:
        this.eventForm.get('weeklySaturday').setValue(1);
        return;


    }
  }

  setMonthly(event$: any) {
    const eventDay = moment(event$);
    const dayOfMonth = eventDay.get('date');
    const weekOfMonth = eventDay.week() - moment().startOf('month').week();
    const weekDay = moment(event$).weekday();

    this.eventForm.get('monthlyDay').setValue(dayOfMonth);
    this.eventForm.get('monthlyNoMonths').setValue(1);
    this.eventForm.get('monthlyWeekOfMonth').setValue(weekOfMonth);
    this.eventForm.get('monthlyDayOfWeek').setValue(weekDay);
    this.eventForm.get('monthlyEveryNoMonths').setValue(1);
  }

  setRange(eventDate: any, occurances: number) {
    const eventDay = moment(eventDate).toDate();

    if (this.pattern === 'daily') {
      this.eventForm.get('rangeEndAfterNo').setValue(occurances);
      this.eventForm.get('rangeEndByDate').setValue(moment(eventDay).add(occurances, 'days').format('YYYY-MM-DD'));
    }
    if (this.pattern === 'weekly') {
      if (moment(eventDay).add(occurances, 'weeks')
        .isBefore(moment(eventDay).add(this.facilityMaxReservationDays, 'days'))) {
        this.eventForm.get('rangeEndAfterNo').setValue(occurances);
        this.eventForm.get('rangeEndByDate').setValue(moment(eventDay).add(occurances, 'weeks').format('YYYY-MM-DD'));
      } else {
        const allowedEndDate = moment(eventDay).add(this.facilityMaxReservationDays, 'days');
        const allowedOccurances = Math.round(moment.duration(allowedEndDate.diff(eventDay)).asWeeks());
        this.eventForm.get('rangeEndAfterNo').setValue(allowedOccurances);
        this.eventForm.get('rangeEndByDate').setValue(moment(eventDay).add(allowedOccurances, 'weeks').format('YYYY-MM-DD'));
      }
    }
    if (this.pattern === 'monthly') {
      if (moment(eventDay).add(occurances, 'months')
        .isBefore(moment(eventDay).add(this.facilityMaxReservationDays, 'days'))) {
        this.eventForm.get('rangeEndAfterNo').setValue(occurances);
        this.eventForm.get('rangeEndByDate').setValue(moment(eventDay).add(occurances, 'months').format('YYYY-MM-DD'));
      } else {
        const allowedEndDate = moment(eventDay).add(this.facilityMaxReservationDays, 'days');
        const allowedOccurances = Math.round(moment.duration(allowedEndDate.diff(eventDay)).asMonths());
        this.eventForm.get('rangeEndAfterNo').setValue(allowedOccurances);
        this.eventForm.get('rangeEndByDate').setValue(moment(eventDay).add(allowedOccurances, 'months').format('YYYY-MM-DD'));
      }
    }
  }

  handleRangeChange($event: any) {
    const maxDate = moment().add(this.facilityMaxReservationDays, 'days');
    let calcEndDate;
    let occurances;

    if ($event.target.id === 'monthly' || $event.target.id === 'weekly' || $event.target.id === 'daily') {
      occurances = this.eventForm.get('rangeEndAfterNo').value;
      switch (this.pattern) {
        case 'daily':
          calcEndDate = moment(this.eventDate.value).add(occurances, 'days');
          break;
        case 'weekly':
          calcEndDate = moment(this.eventDate.value).add(occurances, 'weeks');
          break;
        case 'monthly':
          calcEndDate = moment(this.eventDate.value).add(occurances, 'months');

      }
    } else if ($event.target.id === 'rangeEndAfterNo') {
      // calculate the projected date based on the pass occurnaces
      switch (this.pattern) {
        case 'daily':
          calcEndDate = moment(this.eventDate.value).add($event.target.value, 'days');
          break;
        case 'weekly':
          calcEndDate = moment(this.eventDate.value).add($event.target.value, 'weeks');
          break;
        case 'monthly':
          calcEndDate = moment(this.eventDate.value).add($event.target.value, 'months');

      }
    } else if ($event.target.id === 'rangeEndByDate') {
      calcEndDate = moment($event.target.value);
    } else {
      calcEndDate = moment($event.target.value);
    }

    let endDate;
    if (maxDate.isBefore(calcEndDate)) {
      endDate = maxDate;
    } else {
      endDate = calcEndDate;
    }

    // calculate occurances and set
    switch (this.pattern) {
      case 'daily':
        occurances = moment.duration(endDate.diff(this.eventDate.value)).asDays();
        break;
      case 'weekly':
        occurances = moment.duration(endDate.diff(this.eventDate.value)).asWeeks();
        break;
      case 'monthly':
        occurances = moment.duration(endDate.diff(this.eventDate.value)).asMonths();
    }
    occurances = Math.round(occurances);
    this.setRange(this.eventDate.value, occurances);

  }

  handlePatternChange(event$: any, pattern: string) {
    this.pattern = pattern;
    this.handleRangeChange(event$);
  }
  // set occurances to max date

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
    return this.auth.getAvailableDates(event$.id);
  }
}


