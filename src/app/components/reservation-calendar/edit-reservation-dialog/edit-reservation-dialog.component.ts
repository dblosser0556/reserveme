import { Component, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { EventActionDetail, Resource, Facility } from '../../../models';
import { AutofocusDirective } from '../../../directives/autofocus.directive';
import { CalendarEvent } from 'angular-calendar';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import * as moment from 'moment';
import { ReservationService, AuthService } from '../../../services';
import { Observable } from 'rxjs';
import { RRule, rrulestr, Weekday } from 'rrule';

function maxDateValidator(maxDate: Date) {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const validDate = moment(control.value).isBefore(moment(maxDate));
    return validDate ? null : { 'inValidDate': { value: control.value } };
  };
}

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

  BYDAY = 0;
  BYWEEKDAY = 1;
  EVERYDAY = 0;
  WEEKDAYS = 1;

  byDay = this.BYDAY;
  monthly = this.EVERYDAY;
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
  useEventDateList = true;

  // need to be added to facility
  facilityMaxReservationDays = 185;
  facilityDefaultOccurnaces = 10;
  rrule = new RRule();

  constructor(private fb: FormBuilder, private resService: ReservationService, private auth: AuthService) {
    const maxDate = moment().add(auth.userRole.maxReservationPeriod, 'days').toDate();
    this.createForm();
    const cont = this.eventForm.get('rangeEndByDate');
    cont.setValidators([Validators.required, maxDateValidator(maxDate)]);
  }

  ngOnChanges() {
    let startTime = '';
    let endTime = '';
    if (this.event.end !== undefined) {
      startTime = moment(this.event.start).format('LT');
      endTime = moment(this.event.end).format('LT');
    }

    const date = moment(this.event.start).format('YYYY-MM-DD');

    if (this.rrule.options.freq === this.DAILY) {
      this.eventForm.reset({
        id: this.event.id,
        title: this.event.title,
        eventDate: date,
        startTime: startTime,
        endTime: endTime,
        useRecurring: false,
        pattern: this.rrule.options.freq,
        dailyEveryDays: this.rrule.options.interval,
        rangeEndByDate: moment(this.rrule.options.until).format('YYYY-MM-DD')
      });
    } else if (this.rrule.options.freq === this.WEEKLY) {
      this.eventForm.reset({
        id: this.event.id,
        title: this.event.title,
        eventDate: date,
        startTime: startTime,
        endTime: endTime,
        useRecurring: false,
        pattern: this.rrule.options.freq,

        weeklyInterval: this.rrule.options.interval,
        weeklySunday: this.rrule.options.byweekday.some(val => val === 0),
        weeklyMonday: this.rrule.options.byweekday.some(val => val === 1),
        weeklyTuesday: this.rrule.options.byweekday.some(val => val === 2),
        weeklyWednesday: this.rrule.options.byweekday.some(val => val === 3),
        weeklyThursday: this.rrule.options.byweekday.some(val => val === 4),
        weeklyFriday: this.rrule.options.byweekday.some(val => val === 5),
        weeklySaturday: this.rrule.options.byweekday.some(val => val === 6),
        rangeEndByDate: moment(this.rrule.options.until).format('YYYY-MM-DD')
      });
    } else if (this.rrule.options.freq === this.MONTHLY) {
      this.eventForm.reset({
        id: this.event.id,
        title: this.event.title,
        eventDate: date,
        startTime: startTime,
        endTime: endTime,
        useRecurring: false,
        pattern: this.MONTHLY,
        monthly: (this.rrule.options.byweekday.length > 0) ? '' : '',
        monthlyDayOfWeek: (this.rrule.options.byweekday.length > 0) ?
          this.rrule.options.byweekday[0] : '',
        monthlyWeekOfMonth: '',
        monthDay: (this.rrule.options.bymonthday !== null) ? this.rrule.options.bymonthday : null,
        monthlyInterval: this.rrule.options.interval,
        rangeEndByDate: moment(this.rrule.options.until).format('YYYY-MM-DD')
      });
    } else {
      this.eventForm.reset({
        id: this.event.id,
        title: this.event.title,
        eventDate: date,
        startTime: startTime,
        endTime: endTime,
        useRecurring: false
      });
    }

  }

  async open(detailsData: EventActionDetail, facility: Facility, resource: Resource, userName: string) {


    this.event = detailsData.event;



    this.memberName = userName;
    this.action = detailsData.action;

    // only allow editing the form if type edited.
    if (this.action === 'Edit' || this.action === 'Create') {
      if (detailsData.rrule !== '') {
        this.rrule = RRule.fromString(detailsData.rrule);
      } else {
        this.rrule = new RRule({
          freq: RRule.WEEKLY,
          dtstart: moment(this.event.start).toDate(),
          interval: 1,
          until: moment(this.event.start).add(this.facilityDefaultOccurnaces, 'weeks').toDate(),
          byweekday: moment(this.event.start).weekday()
        });
      }
      this.canEdit = true;

      this.canRecur = this.auth.userRole.canUseRecurring;
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
        this.useEventDateList = true;
      } else {
        this.useEventDateList = false;
      }

    } else {
      this.canEdit = false;
    }



    this.ngOnChanges();
    //  this.setDaily(this.event.start);
    // this.setWeekly(this.event.start);
    /// this.setMonthly(this.event.start);
    /// this.setRange(this.event.start, this.facilityDefaultOccurnaces);

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
      this.show = false;
      this.showRecurring = false;
      this.eventForm.get('useRecurring').setValue(false);
    }
  }

  onSubmit() {
    const eventDetails = this.getEventFromFormValue(this.eventForm.getRawValue());
    this.onOK.emit(eventDetails);
    this.show = false;
    this.showRecurring = false;
    this.eventForm.get('useRecurring').setValue(false);
  }

  onRemove() {
    const eventDetails = this.getEventFromFormValue(this.eventForm.getRawValue());
    this.onDelete.emit(eventDetails);
    this.show = false;
    this.handleRecurringClick();
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
      useRecurring: '',
      pattern: '',
      byDay: '',
      dailyInterval: '',
      weeklyInterval: '',
      weeklySunday: '',
      weeklyMonday: '',
      weeklyTuesday: '',
      weeklyWednesday: '',
      weeklyThursday: '',
      weeklyFriday: '',
      weeklySaturday: '',
      monthly: '',
      monthDay: '',
      monthlyInterval: '',
      monthlyByWeekDay: '',
      monthlyWeekOfMonth: '',
      monthlyDayOfWeek: '',
      rangeEndByDate: ['', [Validators.required]]
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

  get until() {
    return this.eventForm.get('rangeEndByDate');
  }

  getEventFromFormValue(formValue: any): EventActionDetail {
    const startTime = formValue.eventDate + ' ' + formValue.startTime;
    const endTime = formValue.eventDate + ' ' + formValue.endTime;

    const event = {
      id: formValue.id,
      title: formValue.title,
      start: new Date(startTime),
      end: new Date(endTime)
    };

    let rule;

    if (formValue.useRecurring) {
      let rrule;
      switch (formValue.pattern) {

        case RRule.MONTHLY:
          if (formValue.monthly === this.BYDAY) {
            rrule = {
              freq: RRule.MONTHLY,
              dtstart: moment(formValue.eventDate).toDate(),
              interval: formValue.monthlyInterval,
              until: moment(formValue.rangeEndByDate).toDate()
            };
          } else {



            rrule = {
              freq: RRule.MONTHLY,
              dtstart: moment(formValue.eventDate).toDate(),
              byweekday: Number(formValue.monthlyDayOfWeek) - 1,
              bysetpos: Number(formValue.monthlyWeekOfMonth),
              interval: formValue.monthlyInteval,
              until: moment(formValue.rangeEndByDate).toDate()
            };
          }

          break;

        case RRule.WEEKLY:
          const weekDays = new Array<Weekday>();
          // tslint:disable-next-line:no-unused-expression
          (formValue.weeklySunday) ? weekDays.push(this.SU) : '';
          // tslint:disable-next-line:no-unused-expression
          (formValue.weeklyMonday) ? weekDays.push(this.MO) : '';
          // tslint:disable-next-line:no-unused-expression
          (formValue.weeklyTuesday) ? weekDays.push(this.TU) : '';
          // tslint:disable-next-line:no-unused-expression
          (formValue.weeklyWednesday) ? weekDays.push(this.WE) : '';
          // tslint:disable-next-line:no-unused-expression
          (formValue.weeklyThursday) ? weekDays.push(this.TH) : '';
          // tslint:disable-next-line:no-unused-expression
          (formValue.weeklyFriday) ? weekDays.push(this.FR) : '';
          // tslint:disable-next-line:no-unused-expression
          (formValue.weeklySaturday) ? weekDays.push(this.SA) : '';

          rrule = {
            freq: RRule.WEEKLY,
            dtstart: moment(formValue.eventDate).toDate(),
            interval: formValue.weeklyWeeks,
            byweekday: weekDays,
            until: moment(formValue.rangeEndByDate).toDate()
          };

          break;

        case RRule.DAILY:
          if (formValue.byDay === this.EVERYDAY) {
            rrule = {
              freq: RRule.DAILY,
              dtstart: moment(formValue.eventDate).toDate(),
              interval: formValue.dailyEveryDays,
              until: moment(formValue.rangeEndByDate).toDate()
            };
          } else {
            const allWeekDays = [
              this.MO, this.TU, this.WE, this.TH, this.FR
            ];
            rrule = {
              freq: RRule.WEEKLY,
              dtstart: moment(formValue.eventDate).toDate(),
              interval: 1,
              weekDays: allWeekDays,
              until: moment(formValue.rangeEndByDate).toDate()
            };

          }
          break;
      }


      rule = new RRule(
        Object.assign({}, rrule)
      ).toString();
    } else {
      rule = '';
    }



    const details = {
      action: this.action,
      event: event,
      rrule: rule
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
    this.eventForm.get('byDay').setValue(this.EVERYDAY);
    this.eventForm.get('dailyInterval').setValue(1);
  }

  setWeekly(event$: any) {
    this.eventForm.get('weeklySunday').setValue(false);
    this.eventForm.get('weeklyMonday').setValue(false);
    this.eventForm.get('weeklyTuesday').setValue(false);
    this.eventForm.get('weeklyWednesday').setValue(false);
    this.eventForm.get('weeklyThursday').setValue(false);
    this.eventForm.get('weeklyFriday').setValue(false);
    this.eventForm.get('weeklySaturday').setValue(false);

    this.eventForm.get('weeklyInterval').setValue(1);
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
    this.eventForm.get('monthly').setValue(this.BYDAY);
    const eventDay = moment(this.eventDate.value);
    const dayOfMonth = moment(this.eventDate.value).date();
    const weekOfMonth = eventDay.diff(moment(this.eventDate.value).startOf('month'), 'week');
    const weekDay = eventDay.weekday();

    this.eventForm.get('monthDay').setValue(dayOfMonth);
    this.eventForm.get('monthlyInterval').setValue(1);
    this.eventForm.get('monthlyWeekOfMonth').setValue(weekOfMonth);
    this.eventForm.get('monthlyDayOfWeek').setValue(weekDay);
    this.eventForm.get('monthlyInterval').setValue(1);
  }

  setRange(eventDate: Date, occurances: number) {
    let interval;
    switch (this.pattern) {
      case this.MONTHLY:
        interval = 'months';
        break;
      case this.WEEKLY:
        interval = 'weeks';
        break;
      case this.DAILY:
        interval = 'days';
    }
    const calcEndDate = (moment(eventDate).add(occurances, interval)
      .isAfter(moment(this.maxDate))) ?
      this.maxDate : moment(eventDate).add(occurances, interval).toDate();
    this.eventForm.get('rangeEndByDate').setValue(moment(calcEndDate).format('YYYY-MM-DD'));
  }

  handleRecurringClick() {
    this.showRecurring = !this.showRecurring;
    if (!this.showRecurring) {
      this.eventForm.get('useRecurring').setValue(false);
    }
  }


  handlePatternChange(event$: any, pattern: number) {
    this.pattern = pattern;
    switch (this.pattern) {
      case this.MONTHLY:
        this.setMonthly(event$);
        break;
      case this.WEEKLY:
        this.setWeekly(event$);
        break;
      case this.DAILY:
        this.setDaily(event$);
    }
    this.setRange(this.eventDate.value, this.facilityDefaultOccurnaces);
  }

  handleDaily(value: number) {
    this.byDay = value;
  }

  // set occurances to max date

  async getAvailableStartTimes(event$: any) {
    const start = this.eventDate.value + ' ' + event$.target.value;
    this.availableStartTimes = await this.resService.getAvailableStartTimes(this.event,
      this.resource, this.facility, moment(start).toDate());

  }

  async getAvailableEndTimes(event$: any) {
    this.endTime.setValue('');
    const end = this.eventDate.value + ' ' + event$.target.value;
    this.availableEndTimes = await this.resService.getAvailableEndTimes(this.event,
      this.resource, this.facility, moment(end).toDate());
  }

  getAvailableDays(event$: any) {
    return this.auth.getAvailableDates(event$.id);
  }


}


