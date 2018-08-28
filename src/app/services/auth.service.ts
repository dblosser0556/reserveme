import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MessageService } from './message.service';
import { User, Facility, UserRole, RegisterUser, Reservation } from '../models';
import * as moment from 'moment';


interface ResultMessage {
  success: string;
  message: string;
  token: string;
  user: User;
}

@Injectable()
export class AuthService {
  private _facility: Facility = null;
  private _user: User = null;
  private _userRole: UserRole = null;
  private _loggedIn = false;
  private _reservations: Reservation[] = [];

  private _authNavStatusSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  authNavStatus$ = this._authNavStatusSource.asObservable();


  constructor(private http: HttpClient, private messageService: MessageService) { }

  private log(message: string) {
    this.messageService.add(`MemberService:  ${message}`);
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string }>('/v1/users/login', { email: username, password: password })
      .pipe(
        map(result => {
          const helper = new JwtHelperService();
          const token = result.token;
          this._user = result['user'];
          this._facility = this._user['Facility'];
          this._userRole = this._user['UserRole'];
          this._reservations = this._user.Reservations;
          this._loggedIn = true;

          localStorage.setItem('access_token', token.substr(7));
          return true;
        }),
        catchError(this.handleError),
        tap(_ => {
          this.log(`fetched member "${username}"`);
          this._authNavStatusSource.next(true);
        }));

  }

  register(user: RegisterUser): Observable<boolean> {
    return this.http.post<ResultMessage>('/v1/users', user)
      .pipe(
        map((result: ResultMessage) => {
          if (result.success) {
            this._user = result.user;
            this._facility = result.user.Facility;
            this._userRole = {
              id: 0,
              name: 'Unregistered',
              maxReservationsPerDay: 0,
              maxReservationPeriod: 0,
              maxReservationsPerPeriod: 0,
              isAdmin: false,
              FacilityId: this._facility.id
            };
            this._loggedIn = true;

            localStorage.setItem('access_token', result.token.substr(7));
            return true;
          } else {
            return false;
          }
        }),
        catchError(this.handleError),
        tap(_ => {
          this.log(`resgistered member "${user.email}"`);
          this._authNavStatusSource.next(true);
        }));
  }

  logout() {
    localStorage.removeItem('access_token');
    this._facility = null;
    this._user = null;
    this._authNavStatusSource.next(false);
  }

  public get loggedIn(): boolean {
    return this._loggedIn;
  }

  public get userFacility(): Facility {
    return this._facility;
  }

  public get userRole(): UserRole {
    return this._userRole;
  }

  public get reservations(): Reservation[] {
    return this._reservations;
  }

  public get isAdmin(): boolean {
    return (this._userRole.isAdmin);
  }

  public get userId(): number {
    return this._user.id;
  }

  public get currentUser(): User {
    return this._user;
  }

  public get userName(): string {
    return this._user.first + ' ' + this._user.last;
  }

  public canReserve(eventDate: Date): boolean {
    if (this.reservations.length >= this.userRole.maxReservationsPerPeriod) {
      return false;
    }

    const checkDate = moment(eventDate);
    const availableDays = this.getAvailableDates();
    return availableDays.some(day => checkDate.isSame(day, 'day'));
  }

  public getAvailableDates(eventId?: number): string[] {
    const availableDays = new Array<string>();
    const maxDays = (this.userRole.maxReservationPeriod > 185) ? 185 : this.userRole.maxReservationPeriod;
    for (let i = 0; i <= maxDays; i++) {
      // make sure the current user has less than the maximimum reservations per day
      let found = 0;
      const date = moment().add(i, 'days');
      for (const reservation of this.reservations) {
        if (date.isSame(reservation.startDateTime, 'day') && reservation.id !== eventId) {
          found++;
        }
      }
      if (found < this.userRole.maxReservationsPerDay) {
        availableDays.push(date.format('YYYY-MM-DD'));
      }
    }
    return availableDays;
  }
  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(

        `Backend returned code ${error.status}, ` +
        `body was: ${error.error.error}`);
      return throwError(error.error.error);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}



