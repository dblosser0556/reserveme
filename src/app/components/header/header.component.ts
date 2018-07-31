import { Component, OnInit, OnDestroy } from '@angular/core';
import { MemberService } from '../../services';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { Member, Facility } from '../../models';
import { FacilityService } from '../../services/facility.service';

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
  currentUser: Member = null;
  currentFacility: Facility = null;

  constructor(private user: MemberService, private facilityService: FacilityService,
    private router: Router) { }

  ngOnInit() {
    this.subLoginStatus = this.user.authNavStatus$.subscribe(
      status => {
      this.status = status;
        if (status) {

          this.currentUser = this.user.currentUser();

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
    this.user.logOut();
    this.router.navigate(['/login']);
  }

  currentUserIsAdmin(): boolean {
    return this.user.hasRole('admin');
  }

  ngOnDestroy() {
    this.subLoginStatus.unsubscribe();
  }
}
