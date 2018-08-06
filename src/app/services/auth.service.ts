import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MessageService } from './message.service';


@Injectable()
export class AuthService {
  private _facilityId: number;
  private _userId: number;
  private _admin: boolean;
  private _userFirstName: string;
  private _userLastName: string;
  private _loggedIn = false;

  private _authNavStatusSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  authNavStatus$ = this._authNavStatusSource.asObservable();


  constructor(private http: HttpClient, private messageService: MessageService) { }

  private log(message: string) {
    this.messageService.add(`MemberService:  ${message}`);
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string }>('/api/auth', { username: username, password: password })
      .pipe(
        map(result => {
          const helper = new JwtHelperService();
          const decodedToken = helper.decodeToken(result.token);
          this._facilityId = decodedToken.facilityId;
          this._userId = decodedToken.userId;
          this._admin = decodedToken.admin;
          this._userFirstName = decodedToken.firstName;
          this._userLastName = decodedToken.lastName;
          this._loggedIn = true;
          console.log('facilityId', this._facilityId);
          localStorage.setItem('access_token', result.token);
          return true;
        }),
        tap(_ => {
          this.log(`fetched member "${username}"`);
          this._authNavStatusSource.next(true);
        }));

  }

  logout() {
    localStorage.removeItem('access_token');
    this._facilityId = null;
    this._userId = null;
    this._authNavStatusSource.next(false);
  }

  public get loggedIn(): boolean {
    return this._loggedIn;
  }

  public get userFacilityId(): number {
    return this._facilityId;
  }

  public get isAdmin(): boolean {
    return this._admin;
  }

  public get userId(): number {
    return this._userId;
  }

  public get userName(): string {
    return this._userFirstName + ' ' + this._userLastName;
  }

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return error;
    };
  }


}
