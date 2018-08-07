import { Component, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { Reservation } from '../../models';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { CalendarEvent } from 'angular-calendar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { interceptingHandler } from '@angular/common/http/src/module';
import { ReservationService } from '../../services';

export interface DetailsData {
  action: string;
  memberName: string;
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

  constructor(private fb: FormBuilder, private resService: ReservationService) {
    this.createForm();
  }

  ngOnChanges() {
    const startTime = moment(this.event.start).format('hh:mm');
    const endTime = moment(this.event.end).format('hh:mm');
    const date = moment(this.event.start).format('YYYY-MM-DD');
    this.eventForm.reset({
      id: this.event.id,
      title: this.event.title,
      date: date,
      startTime: startTime,
      endTime: endTime
    });
  }

  open(detailsData: DetailsData) {
    this.show = true;
    this.event = detailsData.event;
    this.availableTimes = getAvailableTimes()  //start here
    this.ngOnChanges();

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
      this.onOK.emit(this.event);
    }
  }

  onSubmit() {
    const event = this.getEventFromFormValue(this.eventForm);
    this.onOK.emit(event);
  }

  createForm() {
    this.eventForm = this.fb.group({
      id: '',
      title: '',
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  getMinutes(hour: string): number {
    const timepart = hour.split(':');
    return Number(timepart[0]) * 60 + Number(timepart[1]);
  }

  getEventFromFormValue(formValue: any): CalendarEvent {
    const startTime = moment(formValue.date).add(this.getMinutes(formValue.startTime), 'minutes').toDate();
    const endTime = moment(formValue.date).add(this.getMinutes(formValue.endTime), 'minutes').toDate();
    const event = {
      id: formValue.id,
      title: formValue.title,
      start: startTime,
      end: endTime
    };
    return event;
  }
}


