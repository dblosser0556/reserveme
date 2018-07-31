import { Injectable } from '@angular/core';
import { Reservation } from '../models';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'src/app/services';
import { AbstractRestService } from './abstract.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService extends AbstractRestService<Reservation> {

  constructor(http: HttpClient, message: MessageService) {
    const apiUrl = 'api/reservations';
    super(http, message, apiUrl, 'reservation');
  }
}
