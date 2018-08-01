import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  currentMonth: Date;
  constructor() { }

  ngOnInit() {
  }

  updateMonth($event) {
    this.currentMonth = $event;
  }
}
