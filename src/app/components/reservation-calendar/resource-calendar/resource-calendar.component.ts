import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CalendarEvent, CalendarMonthViewDay, CalendarEventAction } from 'angular-calendar';
import {
  subMonths,
  addMonths,
  addDays,
  addWeeks,
  subDays,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  isToday,
  isSameMonth,
  isSameDay,
  addMinutes,
  getMinutes,
  format,
  isThisQuarter
} from 'date-fns';
import { ReservationService, FacilityService, AuthService, ResourceService } from '../../../services';
import { Reservation, Facility, Resource, resType, EventActionDetail } from '../../../models';
import { BehaviorSubject, Subject } from 'rxjs';
import { EditReservationDialogComponent } from '../edit-reservation-dialog/edit-reservation-dialog.component';
import { ApiMessage } from '../../../models/apiMessage';
import { ToastrService } from 'ngx-toastr';
import RRule, { RRuleSet } from 'rrule';


const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

type CalendarPeriod = 'day' | 'week' | 'month';

function addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: addDays,
    week: addWeeks,
    month: addMonths
  }[period](date, amount);
}

function subPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: subDays,
    week: subWeeks,
    month: subMonths
  }[period](date, amount);
}

function startOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: startOfDay,
    week: startOfWeek,
    month: startOfMonth
  }[period](date);
}

function endOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: endOfDay,
    week: endOfWeek,
    month: endOfMonth
  }[period](date);
}

@Component({
  selector: 'app-resource-calendar',
  templateUrl: './resource-calendar.component.html',
  styles: [`
   .cal-disabled {
    background-color: rgb(247, 125, 125) !important;
    pointer-events: none;
  }
  .cal-disabled .cal-day-number {
    opacity: 0.8;
  }
  `

  ]

})
export class ResourceCalendarComponent implements OnInit, AfterViewInit {

  private _resource = new BehaviorSubject<Resource>(undefined);
  private facility: Facility;
  @ViewChild(EditReservationDialogComponent) modal: EditReservationDialogComponent;
  @Input() set resource(value: Resource) {
    this._resource.next(value);
  }

  get resource() {
    return this._resource.getValue();
  }


  isLoading: boolean;
  view: CalendarPeriod = 'month';
  viewDate: Date = new Date();
  selectedDay: CalendarMonthViewDay;
  events: CalendarEvent[] = [];

  detailsData: EventActionDetail;

  openDetails = false;

  minDate: Date = startOfDay(new Date());
  maxDate: Date;
  maxReservationsPerDay: number = null;
  maxReservationsPerPeriod: number = null;
  prevBtnDisabled = false;
  nextBtnDisabled = false;
  activeDayIsOpen = false;

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-edit"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edit', event);
      }
    },
    {
      label: '<i class="fas fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Delete', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  constructor(private reservationService: ReservationService, private auth: AuthService,
    private resourceService: ResourceService, private toast: ToastrService) {
    this.facility = this.auth.userFacility;
  }

  ngOnInit() {
    this.isLoading = true;

    this._resource.subscribe(resource => {
      if (resource !== undefined) {

        this.startUp();
      }
    });
  }

  ngAfterViewInit(): void {
    this.modal.onOK.subscribe(reservation => {
      this.modal.close();
    });
  }

  startUp() {

    this.maxDate = addDays(new Date(), this.auth.userRole.maxReservationPeriod);
    this.maxReservationsPerDay = this.auth.userRole.maxReservationsPerDay;
    this.maxReservationsPerPeriod = this.auth.userRole.maxReservationsPerPeriod;

    this.dateOrViewChanged();
  }



  increment(): void {
    this.changeDate(addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(subPeriod(this.view, this.viewDate, 1));
  }

  today(): void {
    this.changeDate(new Date());
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

  canReserve(date: Date): boolean {
    return this.auth.canReserve(date);
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarPeriod): void {
    this.view = view;
    this.dateOrViewChanged();
  }

  dateOrViewChanged(): void {
    this.isLoading = true;
    /* this.prevBtnDisabled = !this.dateIsValid(
      endOfPeriod(this.view, subPeriod(this.view, this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1))
    );
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    } */
    this.getReservations();
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
      if (this.selectedDay !== undefined) {
        if (isSameDay(this.selectedDay.date, day.date)) {
          day.cssClass = 'cal-day-selected';
        }
      }
    });
  }

  handleEvent(action: string, event: CalendarEvent): void {
    const userName = this.auth.userName;
    this.detailsData = { action: action, rrule: event.meta.rrule, event: event };
    this.modal.open(this.detailsData, this.facility, this.resource, userName);
  }


  dayClicked(day: CalendarMonthViewDay): void {
    if (isSameMonth(day.date, this.viewDate)) {
      if (this.selectedDay !== undefined) {
        delete this.selectedDay.cssClass;
      }

      this.selectedDay = day;
      // this.selectedDay.cssClass = 'cal-day-selected';
      // day.cssClass = 'cal-day-selected';
      this.viewDate = day.date;
      if (
        (isSameDay(this.viewDate, day.date) && this.activeDayIsOpen === true) ||
        day.events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }
  getReservations(): void {
    const getStart: any = {
      month: startOfMonth,
      week: startOfWeek,
      day: startOfDay
    }[this.view];

    const getEnd: any = {
      month: endOfMonth,
      week: endOfWeek,
      day: endOfDay
    }[this.view];

    this.reservationService.getforResource(this.resource.id, getStart(this.viewDate), getEnd(this.viewDate))
      .subscribe(results => {
        const reservations: Reservation[] = [];
        for (const reservation of results['reservations']) {
          reservations.push(reservation);
        }
        if (reservations.length > 0) {
          const events: CalendarEvent[] = [];
          let color: any;
          reservations.forEach(reservation => {
            switch (reservation.type) {
              case 1:
                color = colors.blue;
                break;
              case 2:
                color = colors.yellow;
                break;
              case 3:
                color = colors.red;
                break;
              case 4:
                color = colors.green;
                break;
            }
            let event: CalendarEvent;
            if (reservation.rrule !== '') {
              const rrule = RRuleSet.fromString(reservation.rrule);
              rrule.all().forEach(date => {
                const startTime = getMinutes(reservation.start);
                const endTime = getMinutes(reservation.end);
                event = {
                  id: reservation.id,
                  title: reservation.title,
                  start: addMinutes(date, startTime),
                  end: addMinutes(date, endTime),
                  color: color,
                  meta: {
                    rrule: reservation.rrule
                  }
                };

                if (reservation.UserId === this.auth.userId) {
                  console.log('event', reservation.title, 'id', reservation.UserId, 'auth', this.auth.userId);
                  event.actions = this.actions;
                }

                events.push(event);
              });
            } else {
              event = {
                id: reservation.id,
                title: reservation.title,
                start: new Date(reservation.start),
                end: new Date(reservation.end),
                color: color,
                meta: {
                  rrule: ''
                }
              };
              if (reservation.UserId === this.auth.userId) {
                console.log('event', reservation.title, 'id', reservation.UserId, 'auth', this.auth.userId);
                event.actions = this.actions;
              }

              events.push(event);
            }

          });
          this.events = events;
          this.isLoading = false;
          this.refresh.next();
        }
      });
  }

  // modal details
  cancelDetails() {
    this.openDetails = false;
  }

  addEvent(event$: any) {

    let _start = startOfDay(this.viewDate);
    _start = addMinutes(_start, this.facility.startHour * 60);
    const _end = addMinutes(_start, this.resource.maxReservationTime);
    const _title = this.auth.userName + ' ' + format(_start, 'hh:mm A') + ' - ' + format(_end, 'hh:mm A');
    const _event = {
      start: _start,
      end: _end,
      title: _title,
      id: 0,
      meta: {
        rrule: ''
      }
    };

    this.handleEvent('Create', _event);
  }

  deleteEvent(eventDetail: EventActionDetail) {
    const event = eventDetail.event;
    this.reservationService.delete(Number(event.id)).subscribe(
      res => {
        const results: ApiMessage = res;
        this.toast.success(results.message, 'Success');
        // remove the reservation for the current user list
        const index = this.auth.reservations.findIndex(_res => _res.id === Number(event.id));
        if (index > -1) {
          this.auth.reservations.splice(index, 0);
        }
        this.dateOrViewChanged();

      }
    );
  }

  saveEvent(eventDetail: EventActionDetail) {
    const event = eventDetail.event;
    let rruleStart, rruleEnd;
    if (eventDetail.rrule !== '') {
      const rrule = RRule.fromString(eventDetail.rrule);
      rruleStart = rrule.options.dtstart;
      rruleEnd = rrule.options.until;
    } else {
      rruleStart = event.start;
      rruleEnd = event.end;
    }
    const reservation = {
      id: Number(event.id),
      title: event.title,
      start: event.start,
      end: event.end,
      type: resType.member,
      ResourceId: this.resource.id,
      UserId: this.auth.userId,
      rrule: eventDetail.rrule,
      rruleStart: rruleStart,
      rruleEnd: rruleEnd
    };

    if (reservation.id === 0) {
      this.reservationService.create(reservation).subscribe(
        res => {
          const results: ApiMessage = res;
          this.toast.success(results.message, 'Success');
          this.auth.reservations.push(results['reservation']);
          this.dateOrViewChanged();
        }
      );
    } else {
      this.reservationService.update(reservation.id, reservation).subscribe(
        res => {
          const results: ApiMessage = res;
          this.toast.success(results.message, 'Success');
          let _reservation: Reservation = this.auth.reservations.find(_res => _res.id === reservation.id);
          _reservation = results['reservation'];
          this.dateOrViewChanged();
        }
      );
    }


  }

}


