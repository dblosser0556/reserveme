import { Component, OnInit, OnChanges, EventEmitter, Input, Output } from '@angular/core';
import { ApiMessage, UserRole } from '../../../../models';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserRoleService } from '../../../../services';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss']
})
export class RoleDetailComponent implements OnInit, OnChanges {
  @Input()
  currentRole: UserRole;
  @Input()
  showDetail: boolean;
  @Output()
  ok: EventEmitter<UserRole> = new EventEmitter<UserRole>();
  @Output()
  cancel: EventEmitter<any> = new EventEmitter();

  roleForm: FormGroup;


  constructor(private fb: FormBuilder,
    private toast: ToastrService,
    private userRoleService: UserRoleService) {
      this.showDetail = false;
      this.createForm();
    
  }

  ngOnInit() {

    this.ngOnChanges();
  }

  ngOnChanges() {
    if (this.currentRole === undefined ) {
      return;
    }

    this.roleForm.reset(
      {
        id: this.currentRole.id,
        name: this.currentRole.name,
        maxReservationPeriod: this.currentRole.maxReservationPeriod,
        maxReservationsPerDay: this.currentRole.maxReservationsPerDay,
        maxReservationsPerPeriod: this.currentRole.maxReservationsPerPeriod,
        isAdmin: this.currentRole.isAdmin,
        class: this.currentRole.class,
        canUseRecurring: this.currentRole.canUseRecurring,
        facilityId: this.currentRole.FacilityId
      });
  }




  close() {
    this.showDetail = false;
    this.cancel.emit();
  }

  submit() {
    this.roleForm.updateValueAndValidity();
    if (this.roleForm.invalid) {
      this.toast.error('Something is wrong.  Try again', 'Oops');
      return;
    }
    const userRole = this.getUserRoleFromFormValue(this.roleForm.value);
    this.ok.emit(userRole);
    this.showDetail = false;
  }


  createForm() {
    this.roleForm = this.fb.group({
      id: '',
      name: ['', Validators.required],
      maxReservationPeriod: ['', Validators.required],
      maxReservationsPerDay: ['', { validator: [Validators.required] }],
      maxReservationsPerPeriod: ['', Validators.required],
      isAdmin: [''],
      class: ['', { validator: [Validators.required] }],
      canUseRecurring: [''],
      facilityId: ''

    });
  }




  getUserRoleFromFormValue(formValue: any): any {

    const item = {
      id: formValue.id,
      name: formValue.name,
      maxReservationPeriod: formValue.maxReservationPeriod,
      maxReservationsPerDay: formValue.maxReservationsPerDay,
      maxReservationsPerPeriod: formValue.maxReservationsPerPeriod,
      isAdmin: formValue.isAdmin,

      class: formValue.class,
      canUseRecurring: formValue.canUseRecurring,
      facilityId: formValue.FacilityId

    };

    return item;

  }

}
