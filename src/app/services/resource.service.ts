import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstract.service';
import { Resource } from '../models';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class ResourceService extends AbstractRestService<Resource> {

  constructor(http: HttpClient, message: MessageService) {
    const apiUrl = 'v1/resources';
    super(http, message, apiUrl, 'resources');
  }
}
