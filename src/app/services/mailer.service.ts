import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { MessageService } from './message.service';
import { Email } from '../models';
import { AbstractRestService } from './abstract.service';


@Injectable({
  providedIn: 'root'
})
export class MailerService extends AbstractRestService<Email> {

  constructor(http: HttpClient, message: MessageService) {
    const apiUrl = 'v1/sendmail';
    super(http, message, apiUrl, 'email');
  }
}

