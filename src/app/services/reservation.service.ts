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
  getAvailableTimes(resourceId: number, date: Date): Observable<string[]> {
    const _resourceId = resourceId.toString();
    const _date = moment(date).format('YYYY-MM-DD');
    const params = new HttpParams()
      .set('resourceId', _resourceId)
      .set('reservationDate', _date);
    const url = 'api/times';
    return this.http.get<string[]>(url, { params }).pipe(
      tap(_ => this.log(`fetched ${this.message} id=${resourceId}`)),
      catchError(this.handleError<string[]>(`getOne ${this.message} id=${resourceId}`))
    );
  }
}
