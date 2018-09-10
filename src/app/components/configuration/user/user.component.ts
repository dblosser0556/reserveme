import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService, AuthService, UserRoleService } from '../../../services';
import { User, UserRole } from '../../../models';

import { ApiMessage } from '../../../models/apiMessage';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})



export class UserComponent implements OnInit {
  isRequesting = false;
  users: User[] = [];
  errors: string;
  userRoles: UserRole[];
  userList: string = null;
  popupEmail = false;
  selected: User[] = [];
  showDeleteConf = false;

  constructor(private userService: UserService, private auth: AuthService,
    private userRoleService: UserRoleService, private toast: ToastrService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.getUserRoles();
  }

  getUsers() {
    this.isRequesting = true;
    let params = new HttpParams();
    params = params.append('FacilityId', this.auth.userFacility.id.toString());
    this.userService.getAll(params).subscribe(
      results => {
        this.users = results['users'];
        for (const user of this.users) {
          if (user['UserRole'] !== undefined) {
            user['roleName'] = user['UserRole'].name;
          } else {
            user['roleName'] = '';
          }
        }
        this.isRequesting = false;
      },
      errors => (this.errors = errors));
  }

  getUserRoles() {
    this.isRequesting = true;
    this.userRoleService.getAll().subscribe(
      results => {
        this.userRoles = results['userRoles'];
        this.getUsers();
      },
      errors => this.errors = errors);
  }

  add() {
    const user = {
      id: 0,
      first: '',
      last: '',
      email: '',
      phone: '',
      password: '',
      FacilityId: this.auth.userFacility.id,
      UserRoleId: 0
    };
    this.userService.currentUser = user;
    this.router.navigate(['/configuration/userdetails']);

  }

  edit() {
    this.userService.currentUser = this.selected[0];
    this.router.navigate(['/configuration/userdetails']);
  }

  confirmDelete() {
    this.showDeleteConf = true; 
  }
  delete() {
    this.userService.delete(this.selected[0].id).subscribe(
      res => {
        this.showDeleteConf = false;
        const results: ApiMessage = res;
        if (results.success === true) {
          this.toast.success(results.message, 'Success');
          this.isRequesting = true;
          this.getUsers();
        } else {
          this.toast.error(results.message, 'Something Went Wrong');
          console.log('Error', results);
        }
      }, error => {
        this.toast.error('Oops something went wrong', 'Error');
        console.log('Error ', error);
      }
    );
  }
  email() {
    this.popupEmail = false;
    this.selected.forEach(user => {
        if (this.userList === null) {
          this.userList = user.email;
        } else {
          this.userList += ',' + user.email;
        }
    });
    console.log(this.userList);
    this.popupEmail = true;
  }
  saveUser(user: User) {

    if (user.id === 0) {
      this.userService.create(user).subscribe(
        res => {
          // user saved
        }, error => this.errors = error
      );
    } else {
      this.userService.update(user.id, user).subscribe(
        res => {

          const results: ApiMessage = res;
          if (results.success === true) {
            this.toast.success(results.message, 'Success');
            this.isRequesting = true;
            this.getUsers();
          } else {
            this.toast.error(results.message, 'Something Went Wrong');
            console.log('Error', results);
          }
        }, error => {
          this.toast.error('Oops something went wrong', 'Error');
          console.log('Error ', error);
        }

      );
    }


  }
  onClose() {
    this.popupEmail = false;
  }

}
