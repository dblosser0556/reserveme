
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from './message.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { MemberService } from './member.service';

export abstract class AbstractRestService<T> {
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

    constructor(protected http: HttpClient,
        protected messageService: MessageService,
        protected actionURL: string,
        protected message: string) { }


    protected log(message: string) {
        this.messageService.add(`Service:  ${message}`);
    }

    getAll(): Observable<T[]> {
        return this.http.get<T[]>(this.actionURL)
            .pipe(
                tap(results => this.log(`fetched ${this.message}`)),
                catchError(this.handleError('getAll', []))
            );
    }

    getOne(id: number): Observable<T> {
        const url = `$(this.actionURL)/${id}`;
        return this.http.get<T>(url).pipe(
            tap(_ => this.log('fetched ${message} id=${id}')),
            catchError(this.handleError<T>(`getOne ${this.message} id=${id}` ))
        );
    }
    /**
    * Handle Http operation that failed.
    * Let the app continue.
    * @param operation - name of the operation that failed
    * @param result - optional value to return as the observable result
    */
    protected handleError<Type>(operation = 'operation', result?: Type) {
        return (error: any): Observable<Type> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as Type);
        };
    }
}
