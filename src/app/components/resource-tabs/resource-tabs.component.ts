import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { Resource, Facility } from '../../models';
import { ResourceService, FacilityService, AuthService } from '../../services';

@Component({
  selector: 'app-resource-tabs',
  templateUrl: './resource-tabs.component.html',
  styleUrls: ['./resource-tabs.component.scss']
})
export class ResourceTabsComponent implements OnInit {
  resources: Resource[];
  facility: Facility;



  isLoading = true;

  constructor(private resourceService: ResourceService,
    private facilityService: FacilityService,
    private authService: AuthService) { }

  ngOnInit() {
    this.getFacility();
  }


  getResources() {
    this.resourceService.getAll()
      .subscribe(results => {
        this.resources = results;
        this.isLoading = false;
      });
  }

  getFacility() {
    this.facilityService.getOne(this.authService.userFacilityId)
      .subscribe(results => {
        this.facility = results;
        this.getResources();
      });

  }
}
