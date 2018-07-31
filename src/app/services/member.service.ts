import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from './message.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Member } from '../models';


@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private url = 'api/members';
  // Observable navItem source
  private _authNavStatusSource = new BehaviorSubject<boolean>(false);
  private loggedInUser: Member = null;
  public loggedIn = false;

  // Observable navItem stream
  authNavStatus$ = this._authNavStatusSource.asObservable();

  constructor(private http: HttpClient,
    private messageService: MessageService) { }


  private log(message: string) {
    this.messageService.add(`MemberService:  ${message}`);
  }

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.url)
      .pipe(
        tap(members => this.log('fetched members')),
        catchError(this.handleError('getMembers', []))
      );
  }

  login(userName: string, password: string): Observable<Member> {
    const url = `${this.url}?userId=${userName}`;
    return this.http.get<Member>(url).pipe(
      map(results => {
        this.loggedInUser = new Member();
        this.loggedInUser = Object.assign(new Member(), results[0]);
        this.loggedIn = true;
        return this.loggedInUser;
      }
      ),
      tap(_ => {
        this.log(`fetched member "${userName}"`);
        this._authNavStatusSource.next(true);
        }),
      catchError(this.handleError<Member>(`login userName=${userName}`)
      ));
  }

  logOut() {
    this.loggedInUser = null;
    this.loggedIn = false;
    this._authNavStatusSource.next(false);
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  currentUser(): Member {
    return this.loggedInUser;
  }

  hasRole(role: string): boolean {
    if (!this.isLoggedIn) {
      return false;
    }
    return true;
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
      return of(result as T);
    };
  }


}
