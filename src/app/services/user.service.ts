import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageService } from './message.service';
import { User } from '../models';
import { AbstractRestService } from './abstract.service';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class UserService extends AbstractRestService<User> {

  constructor(http: HttpClient, message: MessageService) {
    const apiUrl = 'v1/users';
    super(http, message, apiUrl, 'member');
  }

  getNewUsers(facilityId: number): Observable<User[]> {
    const url = `${this.actionURL}/new/${facilityId}`;
    return this.http.get<User[]>(url)
      .pipe(
        map(results => {
          console.log('results');
          return results;
        }),
        tap(results => this.log(`fetched ${this.message}`)),
        catchError(this.handleError('getAll', []))
      );
  }


}



