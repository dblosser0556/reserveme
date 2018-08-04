import { Component, OnInit, OnChanges, Input } from '@angular/core';
import * as moment from 'moment';
import { Resource } from '../../models';

@Component({
  selector: 'app-calendar-day-tabs',
  templateUrl: './calendar-day-tabs.component.html',
  styleUrls: ['./calendar-day-tabs.component.scss']
})
export class CalendarDayTabsComponent implements OnInit, OnChanges {
  @Input() currentMonth: Date;
  @Input() resources: Resource[];

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

    this.isLoading = false;

  }

}
