import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { FacilityService, ResourceService, AuthService } from '../../services';
import { Facility, Resource } from '../../models';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  curFacility: Facility;
  curResources: Resource[];

  currentMonth: Date;
  constructor(private user: AuthService, private facilityService: FacilityService, private resourceService: ResourceService) { }

  ngOnInit() {
    this.getFacility();
    this.getResources();
  }

  updateMonth($event) {
    this.currentMonth = $event;
  }

  getFacility() {
    this.facilityService.getOne(this.user.userFacilityId)
    .subscribe(results => this.curFacility = results);

  }

  getResources() {
    this.resourceService.getAll()
    .subscribe(results => {
      this.curResources = results;
      console.log('Cur Resources', this.curResources);
     });
  }
}
