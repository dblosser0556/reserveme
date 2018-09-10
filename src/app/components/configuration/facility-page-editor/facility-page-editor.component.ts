import { Component, OnInit, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Page } from '../../../models';
import { AuthService } from '../../../services';

@Component({
  selector: 'app-facility-page-editor',
  templateUrl: './facility-page-editor.component.html',
  styleUrls: ['./facility-page-editor.component.scss']
})
export class FacilityPageEditorComponent implements OnInit, OnChanges {

  
  pageForm: FormGroup;
  showDetails: boolean;
  currentPage: Page;
  isRequesting = true;

  constructor(private fb: FormBuilder,
    private toast: ToastrService,
    private auth: AuthService) {
      this.showDetails = false;
      this.createForm();
    
    
  }

  ngOnInit() {
  
    this.currentPage = {
      id: 0,
      name: 'test',
      desc: 'desc',
      endDate: new Date(),
      order: 1,
      published: false,
      FacilityId: this.auth.userFacility.id
    };
    this.ngOnChanges();
    this.isRequesting = false;
  }

  ngOnChanges() {
   
    this.pageForm.reset(
      {
       id: this.currentPage.id,
       name: this.currentPage.name,
       desc: this.currentPage.desc,
       endDate: this.currentPage.endDate,
       order: this.currentPage.order,
       published: this.currentPage.published,
       facilityId: this.currentPage.FacilityId
      });
  }


  contentChanged($event) {

  }

  close() {
    this.showDetails = false;

  }
   
  editDetails() {
    this.showDetails = true;
  }

  submit() {
    this.pageForm.updateValueAndValidity();
    if (this.pageForm.invalid) {
      this.toast.error('Something is wrong.  Try again', 'Oops');
      return;
    }
    const page = this.getpageFromFormValue(this.pageForm.value);

    this.showDetails = false;
  }


  createForm() {
    this.pageForm = this.fb.group({
      id: '',
      name: ['', Validators.required],
      desc: ['', Validators.required],
      endDate: ['', Validators.required],
      order: ['', Validators.required],
      published: '',
      facilityId: '',
      body: ''

    });
  }




  getpageFromFormValue(formValue: any): any {

    const item = {
      id: formValue.id,
      name: formValue.name,
      desc: formValue.desc,
      endDate: formValue.endDate,
      order: formValue.order,
      published: formValue.published,
      FacilityId: formValue.facilityId

    };

    return item;

  }


}
