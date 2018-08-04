import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';
import { Member } from '../models';
import { AbstractRestService } from './abstract.service';


@Injectable({
  providedIn: 'root'
})

export class MemberService extends AbstractRestService<Member> {

  constructor(http: HttpClient, message: MessageService) {
    const apiUrl = 'api/reservations';
    super(http, message, apiUrl, 'reservation');
  }
}



