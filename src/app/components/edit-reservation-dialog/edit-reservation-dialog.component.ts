import { Component, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { Reservation } from '../../models';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { CalendarEvent } from 'angular-calendar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { interceptingHandler } from '@angular/common/http/src/module';
import { ReservationService } from '../../services';
import { Observable } from 'rxjs';

export interface DetailsData {
  action: string;
  memberName: string;
  facilityId: number;
  resourceId: number;
  event: CalendarEvent;
}

@Component({
  selector: 'app-edit-reservation-dialog',
  templateUrl: './edit-reservation-dialog.component.html',
  styleUrls: ['./edit-reservation-dialog.component.scss']
})
export class EditReservationDialogComponent implements OnChanges {
  @ViewChild(AutofocusDirective) autofocus: AutofocusDirective;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onOK: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();

  eventForm: FormGroup;
  show = false;

  event: CalendarEvent;
  action: string;
  memberName: string;
  resourceId: number;
  facilityId: number;
  canEdit = false;
  availableStartTimes: Observable<string[]>;
  availableEndTimes: Observable<string[]>;

  constructor(private fb: FormBuilder, private resService: ReservationService) {
    this.createForm();
    console.log('contructed', new Date());
  }

  ngOnChanges() {
    const startTime = moment(this.event.start).format('LT');
    const endTime = moment(this.event.end).format('LT');
    const date = moment(this.event.start).format('YYYY-MM-DD');
    this.eventForm.reset({
      id: this.event.id,
      title: this.event.title,
      eventDate: date,
      startTime: startTime,
      endTime: endTime
    });
  }

  async open(detailsData: DetailsData) {


    this.event = detailsData.event;
    this.memberName = detailsData.memberName;
    this.action = detailsData.action;

    // only allow editing the form if type edited.
    if (this.action === 'Edit' || this.action === 'Create') {
      this.canEdit = true;
    } else {
      this.canEdit = false;
    }
    this.facilityId = detailsData.facilityId;
    this.resourceId = detailsData.resourceId;

    // this.getAvailableStartTimes();  // start here
    this.availableStartTimes = await this.resService.getAvailableStartTimes(this.event.id.toString(),
      this.resourceId.toString(), this.event.start);
    this.availableEndTimes = await this.resService.getAvailableEndTimes(this.event.id.toString(),
      this.resourceId.toString(), this.event.start);
    this.ngOnChanges();
    this.show = true;

    setTimeout(() => {
      if (this.autofocus) {
        this.autofocus.setFocus();
      }
    }, 0.1);

  }

  close() {
    this.show = false;
  }

  onKeyPress(event) {
    if (event.keyCode === 13) {
      const _event = this.getEventFromFormValue(this.eventForm);
      this.onOK.emit(_event);
    }
  }

  onSubmit() {
    const event = this.getEventFromFormValue(this.eventForm.getRawValue());
    this.onOK.emit(event);
  }

  // update the event title based on the user and times.
  updateTitle(event$: Event): void {
    const title = this.memberName + ' ' + this.startTime.value + ' ' + this.endTime.value;
    this.title.setValue(title);
  }


  createForm() {
    this.eventForm = this.fb.group({
      id: '',
      title: [''],
      eventDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  get title() {
    return this.eventForm.get('title');
  }
  get eventDate() {
    return this.eventForm.get('eventDate');
  }

  get startTime() {
    return this.eventForm.get('startTime');
  }

  get endTime() {
    return this.eventForm.get('endTime');
  }


  getEventFromFormValue(formValue: any): CalendarEvent {
    const startTime = formValue.eventDate + ' ' + formValue.startTime;
    const endTime = formValue.eventDate + ' ' + formValue.endTime;

    const event = {
      id: formValue.id,
      title: formValue.title,
      start: moment(startTime).toDate(),
      end: moment(endTime).toDate()
    };
    return event;
  }

  async getAvailableStartTimes(event$: any) {
    this.availableStartTimes = await this.resService.getAvailableStartTimes(this.event.id.toString(),
      this.resourceId.toString(), event$.target.value);

  }

  async getAvailableEndTimes(event$: any) {
    const endDateTime = this.eventDate.value + ' ' + event$.target.value;
    this.availableEndTimes = await this.resService.getAvailableEndTimes(this.event.id.toString(),
      this.resourceId.toString(),
      moment(endDateTime).toDate());
  }
}


