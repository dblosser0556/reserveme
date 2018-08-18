import { Component, OnInit, OnChanges, EventEmitter, Output } from '@angular/core';
import { AuthService, UserService } from '../../../../services';
import { UserRole, User } from '../../../../models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onOK: EventEmitter<User> = new EventEmitter<User>();

  constructor(private fb: FormBuilder, private auth: AuthService,
    private userService: UserService) {
      this.createForm();
    }

  ngOnInit() {
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


  open(user: User, userRoles: UserRole[]) {
    this.currentUser = user;
    this.userRoles = userRoles;
    this.ngOnChanges();
    this.show = true;
  }

  cancel() {
    this.show = false;
  }

  submit() {
    this.userForm.updateValueAndValidity();
    if (this.userForm.invalid) {
      this.errors = 'Something is wrong.  Try again';
      return;
    }
    const user = this.getUserFromFormValue(this.userForm.value);
    this.onOK.emit(user);
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
