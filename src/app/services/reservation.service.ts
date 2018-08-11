import { Injectable } from '@angular/core';
import { Reservation } from '../models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageService } from './message.service';
import { AbstractRestService } from './abstract.service';
import { Observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService extends AbstractRestService<Reservation> {

  constructor(http: HttpClient, message: MessageService) {
    const apiUrl = 'api/reservations';
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

  getAvailableStartTimes(reservationId: string, resourecId: string, startDateTime: Date): Observable<string[]> {
    const params = new HttpParams()
      .set('reservationId', reservationId)
      .set('resourceId', resourecId)
      .set('startDateTime', moment(startDateTime).format('YYYY-MM-DD'));
    const url = 'api/starttimes';
    return this.http.get<string[]>(url, { params }).pipe(
      tap(_ => this.log(`fetched availble times for id=${reservationId}`)),
      catchError(this.handleError<string[]>(`fetched availble times for id=${reservationId}`))
    );
  }

  getAvailableEndTimes(reservationId: string, resourceId: string, startDateTime: Date): Observable<string[]> {
    const params = new HttpParams()
      .set('reservationId', reservationId)
      .set('resourceId', resourceId)
      .set('startDateTime', moment(startDateTime).format());
    const url = 'api/endtimes';
    return this.http.get<string[]>(url, { params }).pipe(
      tap(_ => this.log(`fetched availble end times for id=${reservationId}`)),
      catchError(this.handleError<string[]>(`fetched availble end times for id=${reservationId}`))
    );
  }
}
