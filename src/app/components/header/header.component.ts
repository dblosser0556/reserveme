import { Component, OnInit, OnDestroy } from '@angular/core';
import { MemberService } from '../../services';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { Member } from '../../models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  status: boolean;
  sideBarActive: boolean;
  subLoginStatus: Subscription;
  currentUser: Member;

  constructor(private user: MemberService,  private router: Router) { }

  ngOnInit( ) {
    this.subLoginStatus = this.user.authNavStatus$.subscribe(
      status => { this.status = status;
        if (status) {

          this.currentUser = this.user.currentUser();
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

  ngOnDestroy( ) {
    this.subLoginStatus.unsubscribe();
  }
}
