import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterUser } from '../../models';
import { first } from 'rxjs/operators';



@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss']
})
export class RegistrationFormComponent implements OnInit {

  errors: any;
  isRequesting: boolean;
  submitted = false;
  userName: string;

  registrationForm: FormGroup;

  constructor(private authService: AuthService,
    private router: Router,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.createForm();
  }



  register() {
    this.registrationForm.updateValueAndValidity();
    if (this.registrationForm.invalid) {
      this.errors = 'Form Invalid.  Please try again.';
      return;
    }
    const user: RegisterUser = this.getUserFromFormValue(this.registrationForm.value);

    this.submitted = true;
    this.isRequesting = true;
    this.errors = '';

    this.authService.register(user)
      .pipe(first())
      .subscribe(result => {
        if (result) {
          this.router.navigate(['/home']);
        } else {
          this.errors = 'something';
        }
        this.isRequesting = false;
      },
        error => {
          this.errors = error;
          this.isRequesting = false;
        });
  }


  createForm() {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', { validator: [Validators.required, Validators.email] }],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', { validator: [Validators.required, this.matchingConfirmPassword] }],
      facilityId: ['', Validators.required],

    }
    );
  }


  matchingConfirmPassword(form: any) {
    const formValue = form['value'];
    if (formValue.password === formValue.confirmPassword) {
      return null;
    } else {
      return form.controls['confirmPassword'].setErrors({ passwordNotEquivalent: true });
    }

  }
  getUserFromFormValue(formValue: any): RegisterUser {

    const item: RegisterUser = {
      first: formValue.firstName,
      last: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      password: formValue.password,
      FacilityId: formValue.facilityId
    };

    return item;

  }


}
