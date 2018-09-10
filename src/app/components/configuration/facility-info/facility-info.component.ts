import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FacilityService, AuthService } from '../../../services';
import { Facility, ApiMessage } from '../../../models';

@Component({
  selector: 'app-facility-info',
  templateUrl: './facility-info.component.html',
  styleUrls: ['./facility-info.component.scss']
})
export class FacilityInfoComponent implements OnInit, OnChanges {

  facilityForm: FormGroup;
  currentFacility: Facility;

  constructor(private fb: FormBuilder,
    private toast: ToastrService,
    private facilityService: FacilityService,
    private auth: AuthService) {

    this.createForm();
    this.currentFacility = auth.userFacility;
  }

  ngOnInit() {

    this.ngOnChanges();
  }

  ngOnChanges() {


    this.facilityForm.reset(
      {
        id: this.currentFacility.id,
        name: this.currentFacility.name,
        contact: this.currentFacility.contact,
        secondContact: this.currentFacility.secondContact,
        phone: this.currentFacility.phone,
        secondPhone: this.currentFacility.secondPhone,
        address: this.currentFacility.address,
        address2: this.currentFacility.address2,
        city: this.currentFacility.city,
        stateCode: this.currentFacility.stateCode,
        zipCode: this.currentFacility.zipCode,
        email: this.currentFacility.email,
        startHour: this.currentFacility.startHour,
        endHour: this.currentFacility.endHour,
        maxReservationDays: this.currentFacility.maxReservationDays
      });
  }






  save() {
    this.facilityForm.updateValueAndValidity();
    if (this.facilityForm.invalid) {
      this.toast.error('Something is wrong.  Try again', 'Oops');
      return;
    }
    const facility = this.getFacilityFromFormValue(this.facilityForm.value);

    if (facility.id === 0) {
      this.facilityService.create(facility).subscribe(
        res => {
          const results: ApiMessage = res;
          if (results.success === true) {
            this.toast.success(results.message, 'Success');

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
      this.facilityService.update(facility.id, facility).subscribe(
        res => {

          const results: ApiMessage = res;
          if (results.success === true) {
            this.toast.success(results.message, 'Success');
            this.currentFacility = facility;
            this.auth.userFacility = facility;
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


  reset() {
    this.ngOnChanges();
  }

  createForm() {
    this.facilityForm = this.fb.group({
      id: '',
      name: ['', Validators.required],
      contact: ['', { validator: [Validators.required] }],
      secondContact: '',
      phone: ['', { validator: [Validators.required] }],
      secondPhone: '',
      address: ['', { validator: [Validators.required] }],
      address2: '',
      city: ['', { validator: [Validators.required] }],
      stateCode: ['', { validator: [Validators.required] }],
      zipCode: ['', { validator: [Validators.required] }],
      email: ['', { validator: [Validators.required] }],
      startHour: '',
      endHour: '',
      maxReservationDays: '',

    });
  }




  getFacilityFromFormValue(formValue: any): Facility {

    const item = {
      id: formValue.id,
      name: formValue.name,
      contact: formValue.contact,
      secondContact: formValue.secondContact,
      phone: formValue.phone,
      secondPhone: formValue.secondPhone,
      address: formValue.address,
      address2: formValue.address2,
      city: formValue.city,
      stateCode: formValue.stateCode,
      zipCode: formValue.zipCode,
      email: formValue.email,
      startHour: formValue.startHour,
      endHour: formValue.endHour,
      maxReservationDays: formValue.maxReservationDays
    };

    return item;

  }

}
