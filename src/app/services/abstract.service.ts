
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MessageService } from './message.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';


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
                map(results => {
                    console.log('results', results);
                    return results;
                }),
                tap(results => this.log(`fetched ${this.message}`)),
                catchError(this.handleError('getAll', []))
            );
    }



    getOne(id: number): Observable<T> {
        const url = `${this.actionURL}/${id}`;
        return this.http.get<T>(url).pipe(
            tap(_ => this.log(`fetched ${this.message} id=${id}`)),
            catchError(this.handleError<T>(`getOne ${this.message} id=${id}`))
        );
    }

    create(body: T): Observable<any> {
        const _body = JSON.stringify(body);
        const headerOptions = new HttpHeaders()
            .set('Content-Type', 'application/json');
        return this.http.post<T>(this.actionURL, _body, { headers: headerOptions }).pipe(
            tap(res => this.log(`created ${this.message} id=${res}`)),
            catchError(this.handleError<any>(`create ${this.message}`))
        );

    }

    update(id: number, body: T): Observable<any> {
        const _body = JSON.stringify(body);
        const headerOptions = new HttpHeaders()
            .set('Content-Type', 'application/json');
        const url = `$(this.actionURL)/${id}`;
        return this.http.post<T>(url, _body, { headers: headerOptions }).pipe(
            tap(res => this.log(`updated ${this.message} id=${res}`)),
            catchError(this.handleError<any>(`updated ${this.message} body=${_body}`))
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
