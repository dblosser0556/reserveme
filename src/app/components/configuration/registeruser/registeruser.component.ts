import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService, AuthService, UserRoleService } from '../../../services';
import { User, UserRole } from '../../../models';
import { UserDetailComponent } from './user-detail/user-detail.component';


@Component({
  selector: 'app-registeruser',
  templateUrl: './registeruser.component.html',
  styleUrls: ['./registeruser.component.scss']
})



export class RegisterUserComponent implements OnInit {
  isRequesting = false;
  users: User[] = [];
  errors: string;
  userRoles: UserRole[];

  @ViewChild(UserDetailComponent) modal: UserDetailComponent;
  constructor(private userService: UserService, private auth: AuthService,
    private userRoleService: UserRoleService) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.isRequesting = true;
    this.userService.getNewUsers(this.auth.userFacility.id).subscribe(
      results => {
        this.users = results['users'];
        this.getUserRoles();
      },
      errors => (this.errors = errors));
  }

  getUserRoles() {
    this.isRequesting = true;
    this.userRoleService.getAll().subscribe(
      results => {
        this.userRoles = results['userRoles'];
        this.isRequesting = false;
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

    this.modal.open(user, this.userRoles);
  }

  edit(user: User) {
    this.modal.open(user, this.userRoles);
  }

  saveUser(user: User) {

    if (user.id === 0) {
      this.userService.create(user).subscribe(
        res => {
          // user saved
        }
      );
    } else {
      this.userService.update(user.id, user).subscribe(
        res => {
          //
        }
      );
    }


  }


}
