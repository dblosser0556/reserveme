import { Component, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { EventActionDetail, Resource, Facility } from '../../../models';
import { AutofocusDirective } from '../../../directives/autofocus.directive';
import { CalendarEvent } from 'angular-calendar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ReservationService, AuthService } from '../../../services';
import { Observable, noop } from 'rxjs';
import { RRule, rrulestr, Weekday } from 'rrule';


@Component({
  selector: 'app-edit-reservation-dialog',
  templateUrl: './edit-reservation-dialog.component.html',
  styleUrls: ['./edit-reservation-dialog.component.scss']
})
export class EditReservationDialogComponent implements OnChanges {
  @ViewChild(AutofocusDirective) autofocus: AutofocusDirective;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onOK: EventEmitter<EventActionDetail> = new EventEmitter<EventActionDetail>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onDelete: EventEmitter<EventActionDetail> = new EventEmitter<EventActionDetail>();
  eventForm: FormGroup;
  show = false;

  // handle recurring features
  canRecur = false;
  showRecurring = false;

  // RRule Frequencies
  DAILY = RRule.DAILY;
  WEEKLY = RRule.WEEKLY;
  MONTHLY = RRule.MONTHLY;

  // RRule WeekDay
  SU = RRule.SU;
  MO = RRule.MO;
  TU = RRule.TU;
  WE = RRule.WE;
  TH = RRule.TH;
  FR = RRule.FR;
  SA = RRule.SA;

  daily = 'dailyEvery';
  monthly = 'monthByDay';
  range = 'endBy';
  pattern = this.WEEKLY;

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
  rrule = new RRule();

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
      endTime: endTime,
      pattern: this.rrule.options.freq,
      dailyEveryDays: this.rrule.options.interval,
      weeklyWeeks: this.rrule.options.interval,
      weeklySunday: this.rrule.options.byweekday.find(val => val === 0),
      weeklyMonday: this.rrule.options.byweekday.find(val => val === 1),
      weeklyTuesday: this.rrule.options.byweekday.find(val => val === 2),
      weeklyWednesday: this.rrule.options.byweekday.find(val => val === 3),
      weeklyThursday: this.rrule.options.byweekday.find(val => val === 4),
      weeklyFriday: this.rrule.options.byweekday.find(val => val === 5),
      weeklySaturday: this.rrule.options.byweekday.find(val => val === 6),
      monthlyDay: this.rrule.options.bymonthday[0],
      monthlyNoMonths: this.rrule.options.freq

    });
  }

  async open(detailsData: EventActionDetail, facility: Facility, resource: Resource, userName: string) {


    this.event = detailsData.event;
    if (detailsData.rrule !== '') {
      this.rrule = RRule.fromString(detailsData.rrule);
    } else {
      this.rrule = new RRule({
        freq: RRule.MONTHLY,
        dtstart: moment(this.event.start).toDate(),
        interval: 1,
        count: 10,
        byweekday: RRule.MO
      });
    }

    this.memberName = userName;
    this.action = detailsData.action;

    // only allow editing the form if type edited.
    if (this.action === 'Edit' || this.action === 'Create') {
      this.canEdit = true;
      this.canRecur = this.auth.userRole.isAdmin;
    } else {
      this.canEdit = false;
    }
    this.facility = facility;
    this.resource = resource;
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
    const eventDetails = this.getEventFromFormValue(this.eventForm.getRawValue());
    this.onOK.emit(eventDetails);
    this.show = false;
  }

  onRemove() {
    const eventDetails = this.getEventFromFormValue(this.eventForm.getRawValue());
    this.onDelete.emit(eventDetails);
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


  getEventFromFormValue(formValue: any): EventActionDetail {
    const startTime = formValue.eventDate + ' ' + formValue.startTime;
    const endTime = formValue.eventDate + ' ' + formValue.endTime;
    let rrule;
    switch (formValue.pattern) {

      case RRule.MONTHLY:
        rrule = {
          freq: RRule.MONTHLY,
          dtstart: new Date(formValue.eventDate),
          interval: formValue.monthlyNoMonths,
          until: new Date(formValue.rangeEndByDate)
        };
        break;

      case RRule.WEEKLY:
        const weekDays = new Array<Weekday>();
        // tslint:disable-next-line:no-unused-expression
        (formValue.weeklySunday) ? weekDays.push(this.SU) : '';
        (formValue.weeklyMonday) ? weekDays.push(this.MO) : '';
        (formValue.weeklyTuesday) ? weekDays.push(this.TU) : '';
        (formValue.weeklyWednesday) ? weekDays.push(this.WE) : '';
        (formValue.weeklyThursday) ? weekDays.push(this.TH) : '';
        (formValue.weeklyFriday) ? weekDays.push(this.FR) : '';
        (formValue.weeklySaturday) ? weekDays.push(this.SA) : '';

        rrule = {
          freq: RRule.WEEKLY,
          dtstart: new Date(formValue.eventDate),
          interval: formValue.weeklyWeeks,
          byweekday: weekDays,
          until: new Date(formValue.rangeEndByDate)
        };

        break;

      case RRule.DAILY:

        break;
    }


     const rule = new RRule(
        Object.assign({}, rrule)
     );
   /*  const rule = new RRule({
      freq: RRule.WEEKLY,
      interval: 5,
      byweekday: [RRule.MO, RRule.FR],
      dtstart: new Date(Date.UTC(2012, 1, 1, 10, 30)),
      until: new Date(Date.UTC(2012, 12, 31))
    }); */

    console.log(rule.toString());

    const event = {
      id: formValue.id,
      title: formValue.title,
      start: moment(startTime).toDate(),
      end: moment(endTime).toDate()
    };
    const details = {
      action: this.action,
      event: event,
      rrule: rule.toString()
    };
    return details;
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
    this.eventForm.get('weeklySunday').setValue(false);
    this.eventForm.get('weeklyMonday').setValue(false);
    this.eventForm.get('weeklyTuesday').setValue(false);
    this.eventForm.get('weeklyWednesday').setValue(false);
    this.eventForm.get('weeklyThursday').setValue(false);
    this.eventForm.get('weeklyFriday').setValue(false);
    this.eventForm.get('weeklySaturday').setValue(false);

    this.eventForm.get('weeklyWeeks').setValue(1);
    const weekDay = moment(event$).weekday();
    switch (weekDay) {
      case 0:
        this.eventForm.get('weeklySunday').setValue(true);
        return;
      case 1:
        this.eventForm.get('weeklyMonday').setValue(true);
        return;
      case 2:
        this.eventForm.get('weeklyTuesday').setValue(true);
        return;
      case 3:
        this.eventForm.get('weeklyWednesday').setValue(true);
        return;
      case 4:
        this.eventForm.get('weeklyThursday').setValue(true);
        return;
      case 5:
        this.eventForm.get('weeklyFriday').setValue(true);
        return;
      case 6:
        this.eventForm.get('weeklySaturday').setValue(true);
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

    if (this.pattern === this.DAILY) {
      this.eventForm.get('rangeEndAfterNo').setValue(occurances);
      this.eventForm.get('rangeEndByDate').setValue(moment(eventDay).add(occurances, 'days').format('YYYY-MM-DD'));
    }
    if (this.pattern === this.WEEKLY) {
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
    if (this.pattern === this.MONTHLY) {
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
        case this.DAILY:
          calcEndDate = moment(this.eventDate.value).add(occurances, 'days');
          break;
        case this.WEEKLY:
          calcEndDate = moment(this.eventDate.value).add(occurances, 'weeks');
          break;
        case this.MONTHLY:
          calcEndDate = moment(this.eventDate.value).add(occurances, 'months');

      }
    } else if ($event.target.id === 'rangeEndAfterNo') {
      // calculate the projected date based on the pass occurnaces
      switch (this.pattern) {
        case this.DAILY:
          calcEndDate = moment(this.eventDate.value).add($event.target.value, 'days');
          break;
        case this.WEEKLY:
          calcEndDate = moment(this.eventDate.value).add($event.target.value, 'weeks');
          break;
        case this.MONTHLY:
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
      case this.DAILY:
        occurances = moment.duration(endDate.diff(this.eventDate.value)).asDays();
        break;
      case this.WEEKLY:
        occurances = moment.duration(endDate.diff(this.eventDate.value)).asWeeks();
        break;
      case this.MONTHLY:
        occurances = moment.duration(endDate.diff(this.eventDate.value)).asMonths();
    }
    occurances = Math.round(occurances);
    this.setRange(this.eventDate.value, occurances);

  }

  handlePatternChange(event$: any, pattern: number) {
    this.pattern = pattern;
    this.handleRangeChange(event$);
  }
  // set occurances to max date

  async getAvailableStartTimes(event$: any) {
    const start = this.eventDate.value + ' ' + event$.target.value;
    this.availableStartTimes = await this.resService.getAvailableStartTimes(this.event,
      this.resource, this.facility, moment(start).toDate());

  }

  async getAvailableEndTimes(event$: any) {
    const end = this.eventDate.value + ' ' + event$.target.value;
    this.availableEndTimes = await this.resService.getAvailableEndTimes(this.event,
      this.resource, this.facility, moment(end).toDate());
  }

  getAvailableDays(event$: any) {
    return this.auth.getAvailableDates(event$.id);
  }
}


