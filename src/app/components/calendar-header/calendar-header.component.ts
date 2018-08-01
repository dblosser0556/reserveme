import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-header',
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss']
})
export class CalendarHeaderComponent implements OnInit {
  today: moment.Moment;
  currentMonth: moment.Moment;
  month: string;

  @Output() changedMonth = new EventEmitter<Date>();
  constructor() { }

  ngOnInit() {
    this.today = moment();
    this.currentMonth = moment();
  }

  monthSub() {
    this.currentMonth.add(-1, 'month');
    this.changedMonth.emit(this.currentMonth.toDate());
  }

  monthAdd() {
    this.currentMonth.add(1, 'month');
    this.changedMonth.emit(this.currentMonth.toDate());
  }

  yearSub() {
    this.currentMonth.add(-1, 'year');
    this.changedMonth.emit(this.currentMonth.toDate());
  }

  yearAdd() {
    this.currentMonth.add(1, 'year');
    this.changedMonth.emit(this.currentMonth.toDate());
  }

}
