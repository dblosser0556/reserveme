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
  isSameDay
} from 'date-fns';
import { ReservationService, FacilityService, AuthService } from '../../services';
import { Reservation, Facility } from '../../models';
import { BehaviorSubject, Subject } from 'rxjs';
import { EditReservationDialogComponent } from '../edit-reservation-dialog/edit-reservation-dialog.component';


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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resource-calendar.component.html',
  styleUrls: ['./resource-calendar.component.scss'],

})
export class ResourceCalendarComponent implements OnInit, AfterViewInit {
  private _resourceId = new BehaviorSubject<number>(undefined);
  private _facility = new BehaviorSubject<Facility>(undefined);

  @ViewChild(EditReservationDialogComponent) modal: EditReservationDialogComponent;
  @Input() set resourceId(value: number) {
    this._resourceId.next(value);
  }

  get resourceId() {
    return this._resourceId.getValue();
  }

  @Input() set facility(value: Facility) {
    this._facility.next(value);
  }

  get facility() {
    return this._facility.getValue();
  }

  isLoading: boolean;

  view: CalendarPeriod = 'month';

  viewDate: Date = new Date();

  events: CalendarEvent[] = [];

  detailsData: {
    action: string;
    memberName: string;
    event: CalendarEvent;
  };

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
      label: '<i class="fa fa-fw fa-pencil">e</i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times">d</i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  constructor(private reservationService: ReservationService, private auth: AuthService) {

  }

  ngOnInit() {
    this.isLoading = true;

    this._resourceId.subscribe(x => {
      if (x !== undefined) {
        if (this.facility !== undefined) {
          this.startUp();
        }
      }
    });

    this._facility.subscribe(facility => {
      if (facility !== undefined) {
        if (this.resourceId !== undefined) {
          this.startUp();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.modal.onOK.subscribe(reservation => {
      this.modal.close();
    });
  }

  startUp() {
    if (this.auth.isAdmin) {
      this.maxDate = addDays(new Date(), this.facility.adminMaxReservationDays);
      this.maxReservationsPerDay = null;
      this.maxReservationsPerPeriod = null;
    } else {
      this.maxDate = addDays(new Date(), this.facility.memberMaxReservationDays);
      this.maxReservationsPerDay = this.facility.memberMaxReservationPerDay;
      this.maxReservationsPerPeriod = this.facility.memberMaxReserviationsPer;
    }
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
    this.prevBtnDisabled = !this.dateIsValid(
      endOfPeriod(this.view, subPeriod(this.view, this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1))
    );
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
    this.getReservations();
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  handleEvent(action: string, event: CalendarEvent): void {
    const userName = this.auth.userName;
    this.detailsData = { action: action, memberName: userName, event: event };
    this.modal.open(this.detailsData);
  }


  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
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

    this.reservationService.getforResource(this.resourceId, getStart(this.viewDate), getEnd(this.viewDate))
      .subscribe(results => {
        const reservations: Reservation[] = results;
        if (reservations !== null) {
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
            const event: CalendarEvent = {
              title: reservation.title,
              start: new Date(reservation.startDateTime),
              end: new Date(reservation.endDateTime),
              color: color
            };
            if (reservation.memberId === this.auth.userId) {
              console.log('event', reservation.title, 'id', reservation.memberId, 'auth', this.auth.userId);
              event.actions = this.actions;
            }

            events.push(event);
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


}


