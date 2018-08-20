import { Component, OnInit, OnChanges } from '@angular/core';
import { UserService, AuthService, UserRoleService } from '../../../services';
import { User, UserRole } from '../../../models';

import { ApiMessage } from '../../../models/apiMessage';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';

interface PatchUser {
  id: number;
  data: {
    UserRoleId: number;
  };
}

@Component({
  selector: 'app-registeruser',
  templateUrl: './registeruser.component.html',
  styleUrls: ['./registeruser.component.scss']
})




export class RegisterUserComponent implements OnInit, OnChanges {
  isRequesting = false;
  users: User[] = [];
  errors: string;
  userRoles: UserRole[];
  newUsersForm: FormGroup;
  showDeleteConf: boolean;
  selectedUser: User;


  constructor(private userService: UserService, private fb: FormBuilder, private auth: AuthService,
    private userRoleService: UserRoleService, private toast: ToastrService) {
    this.createForm();
  }

  ngOnInit() {
    this.isRequesting = true;
    this.getUserRoles();
  }

  ngOnChanges() {
    this.newUsersForm.reset();
    this.setNewUser(this.users);
  }

  getUsers() {
    this.isRequesting = true;
    this.userService.getNewUsers(this.auth.userFacility.id).subscribe(
      results => {
        this.users = results['users'];
        console.log('users', this.users);
        this.ngOnChanges();
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

  createForm() {
    this.newUsersForm = this.fb.group({
      newUsers: this.fb.array([])
    });
  }

  setNewUser(users: User[]) {
    const newUserFGs = users.map(user =>
      this.createNewUser(user)
    );

    const newUsersFormArray = this.fb.array(newUserFGs);
    this.newUsersForm.setControl('newUsers', newUsersFormArray);
  }

  createNewUser(user: User) {
    return this.fb.group({
      id: user.id,
      userName: [user.first + ' ' + user.last],
      phone: user.phone,
      email: user.email,
      userRoleId: user.UserRoleId
    });
  }

  submit() {
    this.newUsersForm.updateValueAndValidity();
    if (this.newUsersForm.invalid) {
      this.toast.error(this.newUsersForm.errors.toString(), 'Oops Somthing is wrong');
    }
    const newUsers: PatchUser[] = this.getUsersFromFormValue(this.newUsersForm.value);
    if (newUsers.length === 0) {
      this.toast.info('There is nothing to update.  You need to select the user role', 'Oops');
      return;
    }
    for (const newUser of newUsers) {
      this.userService.patch(newUser.id, newUser.data).subscribe(
        res => {
          const results: ApiMessage = res;
          if (results.success === true) {
            this.toast.success(results.message, 'Success');
            this.getUsers();
            this.isRequesting = true;
          } else {
            this.toast.error(results.message, 'Something Went Wrong');
            console.log('Error', results);
          }
        }, error => {
          this.toast.error('Oops something went wrong', 'Error');
          console.log('Error ', error);
        });
    }
  }

  getUsersFromFormValue(formValue: any): PatchUser[] {
    const patchUsers: PatchUser[] = [];
    for (const user of formValue.newUsers) {

        if (user.userRoleId !== undefined && user.userRoleId !== null) {
          const data = { UserRoleId: user.userRoleId };
          const patchUser = {
            id: user.id,
            data: data
          };
          patchUsers.push(patchUser);
        }
      }
    return patchUsers;
  }

  confirmDelete(user: User) {
    this.selectedUser = user;
    this.showDeleteConf = true;
  }

  onDelete() {
    this.showDeleteConf = false;
    this.userService.delete(this.selectedUser.id)
      .subscribe(res => {

        const results: ApiMessage = res;
        if (results.success === true) {
          this.toast.success(results.message, 'Success');
          this.isRequesting = true;
        } else {
          this.toast.error(results.message, 'Something Went Wrong');
          console.log('Error', results);
        }
      }, error => {
        this.toast.error('Oops something went wrong', 'Error');
        console.log('Error ', error);
      });
  }

}
