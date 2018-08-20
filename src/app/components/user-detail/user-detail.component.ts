import { Component, OnInit, OnChanges, EventEmitter, Output } from '@angular/core';
import { AuthService, UserService, UserRoleService } from '../../services';
import { UserRole, User } from '../../models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiMessage } from '../../models/apiMessage';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnChanges {
  userRoles: UserRole[] = [];
  isRequesting = false;
  errors: string;
  userForm: FormGroup;
  currentUser: User;
  show = false;
  showRole = true;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onOK: EventEmitter<User> = new EventEmitter<User>();

  constructor(private fb: FormBuilder, private auth: AuthService,
    private userService: UserService, private toast: ToastrService,
    private userRoleService: UserRoleService, private router: Router, private activeRoute: ActivatedRoute) {
    this.createForm();
    this.getUserRoles();
  }

  ngOnInit() {
    this.currentUser = this.userService.currentUser;
    if (this.currentUser === undefined) {
      this.showRole = false;
      this.currentUser = this.auth.currentUser;
    }
    this.ngOnChanges();
  }

  ngOnChanges() {
    this.userForm.reset(
      {
        id: this.currentUser.id,
        firstName: this.currentUser.first,
        lastName: this.currentUser.last,
        email: this.currentUser.email,
        phone: this.currentUser.phone,
        password: this.currentUser.password,
        confirmPassword: this.currentUser.password,
        facilityId: this.currentUser.FacilityId,
        userRoleId: this.currentUser.UserRoleId
      });
  }

  getUserRoles() {
    const params = new HttpParams();
    params.append('FacilityId', this.auth.userFacility.id.toString());
    this.userRoleService.getAll(params).subscribe(
      res => {
        this.userRoles = res['userRoles'];
      }
    );
  }


  cancel() {
    if (this.router.url === '/configuration/userdetails') {
      this.router.navigate(['/configuration/users']);
    }
  }

  submit() {
    this.userForm.updateValueAndValidity();
    if (this.userForm.invalid) {
      this.errors = 'Something is wrong.  Try again';
      return;
    }
    const user = this.getUserFromFormValue(this.userForm.value);


    if (user.id === 0) {
      this.userService.create(user).subscribe(
        res => {
          const results: ApiMessage = res;
          if (results.success === true) {
            this.toast.success(results.message, 'Success');
            if (this.router.url === '/configuration/userdetails') {
              this.router.navigate(['/configuration/users']);
            }
          } else {
            this.toast.error(results.message, 'Something Went Wrong');
            console.log('Error', results);
          }
        }, error => {
          this.toast.error('Oops something went wrong', 'Error');
          console.log('Error ', error);
        }
      );
    } else {
      this.userService.update(user.id, user).subscribe(
        res => {

          const results: ApiMessage = res;
          if (results.success === true) {
            this.toast.success(results.message, 'Success');
            if (this.router.url === '/configuration/userdetails') {
              this.router.navigate(['/configuration/users']);
            }
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


  createForm() {
    this.userForm = this.fb.group({
      id: '',
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', { validator: [Validators.required, Validators.email] }],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', { validator: [Validators.required, this.matchingConfirmPassword] }],
      facilityId: ['', Validators.required],
      userRoleId: ['', Validators.required],

    });
  }


  matchingConfirmPassword(form: any) {
    const formValue = form['value'];
    if (formValue.password === formValue.confirmPassword) {
      return null;
    } else {
      return form.controls['confirmPassword'].setErrors({ passwordNotEquivalent: true });
    }

  }

  getUserFromFormValue(formValue: any): any {

    const item = {
      id: formValue.id,
      first: formValue.firstName,
      last: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      password: formValue.password,
      FacilityId: formValue.facilityId,
      UserRoleId: formValue.userRoleId
    };

    return item;

  }
}
