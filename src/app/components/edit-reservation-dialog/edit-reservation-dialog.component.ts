import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { Reservation } from '../../models';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-edit-reservation-dialog',
  templateUrl: './edit-reservation-dialog.component.html',
  styleUrls: ['./edit-reservation-dialog.component.scss']
})
export class EditReservationDialogComponent {
  @ViewChild(AutofocusDirective) autofocus: AutofocusDirective;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onOK: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();

  show = false;

  event: CalendarEvent;

  open(event: CalendarEvent) {
    this.show = true;
    this.event = Object.create(event); // clone the user (we don't want to modify the original in the dialog)

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
    this.onOK.emit(this.event);
  }

}
