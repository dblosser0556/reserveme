import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';
import { UserRole } from '../models/userRole';
import { AbstractRestService } from './abstract.service';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService extends AbstractRestService<UserRole> {

  constructor(http: HttpClient, message: MessageService) {
    const apiUrl = 'v1/userroles';
    super(http, message, apiUrl, 'userroles');
  }
}
