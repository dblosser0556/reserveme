import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstract.service';
import { Facility } from '../models';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';
import { MemberService } from './member.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FacilityService extends AbstractRestService<Facility> {

  private _authNavStatusSource;
  facility: Facility;
  authNavStatus$: any;

  constructor(http: HttpClient, message: MessageService) {
    const apiUrl = 'api/facilities';
    super(http, message, apiUrl, 'facility');
    this._authNavStatusSource = new BehaviorSubject<boolean>(false);
    this.authNavStatus$ = this._authNavStatusSource.asObservable();
  }

  getOne(id: number): Observable<Facility> {
    const url = `${this.actionURL}/${id}`;
    return this.http.get<Facility>(url).pipe(
      map(result => {
        this.facility = result;
        return this.facility;
      }
      ),
      tap(_ => {
        this.log(`fetched facility id=${id}`);
        this._authNavStatusSource.next(true);
      }),
      catchError(this.handleError<Facility>(`getOne ${this.message} id=${id}`))
    );
  }

  currentFacility() {
    return this.facility;
  }
}
