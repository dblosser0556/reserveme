import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('auth gaurd');
    console.log('logged in', this.auth.loggedIn);
    if (this.auth.loggedIn) {
      return true;
    }

    this.router.navigate(['login']);
    return false;
  }
}
