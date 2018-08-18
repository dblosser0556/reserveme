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
  format,
  isThisQuarter
} from 'date-fns';
import { ReservationService, FacilityService, AuthService, ResourceService } from '../../../services';
import { Reservation, Facility, Resource, resType } from '../../../models';
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
  templateUrl: './resource-calendar.component.html',
  styleUrls: ['./resource-calendar.component.scss'],

})
export class ResourceCalendarComponent implements OnInit, AfterViewInit {

  private _resource = new BehaviorSubject<Resource>(undefined);
  private _facility = new BehaviorSubject<Facility>(undefined);

  @ViewChild(EditReservationDialogComponent) modal: EditReservationDialogComponent;
  @Input() set resource(value: Resource) {
    this._resource.next(value);
  }

  get resource() {
    return this._resource.getValue();
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
    facility: Facility;
    resource: Resource;
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
        this.handleEvent('Edit', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times">d</i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Delete', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  constructor(private reservationService: ReservationService, private auth: AuthService,
    private resourceService: ResourceService) {

  }

  ngOnInit() {
    this.isLoading = true;

    this._resource.subscribe(resource => {
      if (resource !== undefined) {

        if (this.facility !== undefined) {
          this.startUp();
        }
      }
    });

    this._facility.subscribe(facility => {
      if (facility !== undefined) {
        if (this.resource !== undefined) {
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

    this.maxDate = addDays(new Date(), this.auth.userRole.maxReservationPeriod);
    this.maxReservationsPerDay = this.auth.userRole.maxReserervationsPerDay;
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
    this.detailsData = { action: action, facility: this.facility, resource: this.resource, memberName: userName, event: event };
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
            const event: CalendarEvent = {
              id: reservation.id,
              title: reservation.title,
              start: new Date(reservation.startDateTime),
              end: new Date(reservation.endDateTime),
              color: color
            };
            if (reservation.UserId === this.auth.userId) {
              console.log('event', reservation.title, 'id', reservation.UserId, 'auth', this.auth.userId);
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

  addEvent(event$: any) {

    let _start = startOfDay(new Date());
    _start = addMinutes(_start, this.facility.startHour * 60);
    const _end = addMinutes(_start, this.resource.maxReservationTime);
    const _title = this.auth.userName + ' ' + format(_start, 'hh:mm A') + ' - ' + format(_end, 'hh:mm A');
    const _event = {
      start: _start,
      end: _end,
      title: _title,
      id: 0
    };

    this.handleEvent('Create', _event);
  }

  saveEvent(event: CalendarEvent) {

    const reservation = {
      id: Number(event.id),
      title: event.title,
      startDateTime: event.start,
      endDateTime: event.end,
      type: resType.member,
      createdAt: new Date(),
      updatedAt: new Date(),
      ResourceId: this.resource.id,
      UserId: this.auth.userId
    };

    if (reservation.id === 0) {
      this.reservationService.create(reservation).subscribe(
        res => {
          this.dateOrViewChanged();
        }
      );
    } else {
      this.reservationService.update(reservation.id, reservation).subscribe(
        res => {
          this.dateOrViewChanged();
        }
      );
    }


  }

}


