import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, FacilityService } from '../../services';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { Member, Facility } from '../../models';
import {  } from '../../services/facility.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  status: boolean;
  facilityStatus: boolean;
  sideBarActive: boolean;
  subLoginStatus: Subscription;
  subFacilityStatus: Subscription;
  currentUser: string = null;
  currentFacility: Facility = null;

  constructor(private user: AuthService, private facilityService: FacilityService,
    private router: Router) { }

  ngOnInit() {
    this.subLoginStatus = this.user.authNavStatus$.subscribe(
      status => {
      this.status = status;
        if (status) {

            this.currentUser = this.user.userName;

        }
      });
    this.subFacilityStatus = this.facilityService.authNavStatus$.subscribe(
      status => {
      this.facilityStatus = status;
        if (status) {
          this.currentFacility = this.facilityService.currentFacility();
          console.log('Current Facility:', this.currentFacility);
        }
      });

  }

  logout() {
    this.user.logout();
    this.router.navigate(['/login']);
  }

  currentUserIsAdmin(): boolean {
    return this.user.isAdmin;
  }

  ngOnDestroy() {
    this.subLoginStatus.unsubscribe();
    this.subFacilityStatus.unsubscribe();
  }
}
