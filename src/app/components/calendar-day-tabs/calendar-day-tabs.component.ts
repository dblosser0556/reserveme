import { Component, OnInit, OnChanges, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-day-tabs',
  templateUrl: './calendar-day-tabs.component.html',
  styleUrls: ['./calendar-day-tabs.component.scss']
})
export class CalendarDayTabsComponent implements OnInit, OnChanges {
  @Input() currentMonth: Date;
  days: Date[];
  currentDay = 7;
  isLoading = true;

  constructor() { }

  ngOnInit() {
   // this.currentMonth = moment();
  //  this.ngOnChanges();
  }

  ngOnChanges() {
    if (this.currentMonth === undefined) {
      this.currentMonth = moment().toDate();
    }
    const firstOfCurrentMonth = moment(this.currentMonth).startOf('month');
    this.days = new Array<Date>();

    for (let i = 0; i < firstOfCurrentMonth.daysInMonth(); i++) {
      const _day = moment(firstOfCurrentMonth).add(i, 'day');
      this.days.push(_day.toDate());
    }
    this.isLoading = false;

  }

}
