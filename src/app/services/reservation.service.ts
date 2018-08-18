import { Injectable } from '@angular/core';
import { Reservation, Resource, Facility } from '../models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageService } from './message.service';
import { AbstractRestService } from './abstract.service';
import { Observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import * as moment from 'moment';
import { CalendarEvent } from 'angular-calendar';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService extends AbstractRestService<Reservation> {

  constructor(http: HttpClient, message: MessageService) {
    const apiUrl = 'v1/reservations';
    super(http, message, apiUrl, 'reservation');
  }

  getforResource(resourceId: number, startDate: Date, endDate: Date): Observable<Reservation[]> {
    const _startDate = moment(startDate).format('YYYY-MM-DD');
    const _endDate = moment(endDate).format('YYYY-MM-DD');
    const _resourceId = resourceId.toString();
    const params = new HttpParams()
      .set('resourceId', _resourceId)
      .set('beginDate', _startDate)
      .set('endDate', _endDate);

    const url = `${this.actionURL}`;
    return this.http.get<Reservation[]>(url, { params }).pipe(
      tap(_ => this.log(`fetched ${this.message} id=${resourceId}`)),
      catchError(this.handleError<Reservation[]>(`getOne ${this.message} id=${resourceId}`))
    );
  }

  getAvailableStartTimes(event: CalendarEvent, resource: Resource, facility: Facility, start: Date): Observable<string[]> {
    const _startDate = moment(start).startOf('day').format('YYYY-MM-DD');
    const _endDate = moment(start).endOf('day').format('YYYY-MM-DD');
    const _resourceId = resource.id.toString();
    const params = new HttpParams()
      .set('resourceId', _resourceId)
      .set('beginDate', _startDate)
      .set('endDate', _endDate);

    const url = `${this.actionURL}`;
    return this.http.get<string[]>(url, { params }).pipe(
      map(results => {
        const reservations: Reservation[] = [];
        for (const reservation of results['reservations']) {
          if (reservation.id !== event.id) {
            reservations.push(reservation);
          }
        }
        return this.getTimes(facility.startHour * 60, facility.endHour * 60, resource.minReservationTime, reservations);
      }),
      tap(_ => this.log(`fetched ${this.message} id=${resource.id}`)),
      catchError(this.handleError<string[]>(`getOne ${this.message} id=${resource.id}`))
    );
  }

  getAvailableEndTimes(event: CalendarEvent, resource: Resource, facility: Facility, start: Date): Observable<string[]> {
    const _startDate = moment(start).startOf('day').format('YYYY-MM-DD');
    const _endDate = moment(start).endOf('day').format('YYYY-MM-DD');
    const _resourceId = resource.id.toString();
    const params = new HttpParams()
      .set('resourceId', _resourceId)
      .set('beginDate', _startDate)
      .set('endDate', _endDate);

    const url = `${this.actionURL}`;
    return this.http.get<string[]>(url, { params }).pipe(
      map(results => {
        const reservations: Reservation[] = [];
        for (const reservation of results['reservations']) {
          if (reservation.id !== event.id) {
            reservations.push(reservation);
          }
        }
        const startTime = moment(start);
        const midnight = startTime.clone().startOf('day');
        const _startTime = startTime.diff(midnight, 'minutes');
        const _facilityEndTime = facility.endHour * 60;
        let _endTime = _startTime + resource.maxReservationTime;
        if (_endTime > _facilityEndTime) {
          _endTime = _facilityEndTime;
        }

        return this.getTimes(_startTime + resource.minReservationTime, _endTime, resource.minReservationTime, reservations);
      }),
      tap(_ => this.log(`fetched ${this.message} id=${resource.id}`)),
      catchError(this.handleError<string[]>(`getOne ${this.message} id=${resource.id}`))
    );
  }



  getTimes(startTime: number, endTime: number, minReservationTime: number, reservations: Reservation[]): string[] {

    const allTimes = new Array();
    // create a list of possible times for the facility
    for (let time = startTime; time <= endTime; time = time + minReservationTime) {
      let found = false;

      // make sure the time is not reserved
      for (let j = 0; j < reservations.length; j++) {
        const _startDate = moment(reservations[j].startDateTime);
        const _endDate = moment(reservations[j].endDateTime);
        const _midNight = _startDate.clone().startOf('day');
        const _startTime = _startDate.diff(_midNight, 'minutes');
        const _endTime = _endDate.diff(_midNight, 'minutes');
        if (_startTime <= time && _endTime >= time) {
          found = true;
        }
      }
      if (!found) {
        allTimes.push(this.convertMinsToHrsMins(time));
      }
      found = false;
    }

    return allTimes;
  }

  convertMinsToHrsMins(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    const _a = h < 12 ? 'AM' : 'PM';
    const _h = h > 12 ? h - 12 : h;
    const _m = m < 10 ? '0' + m : m;

    return `${_h}:${_m} ${_a}`;
  }
}
