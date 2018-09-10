import { Component, OnInit } from '@angular/core';
import { UserRole, ApiMessage } from '../../../models';
import { AuthService, UserRoleService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-roles',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {

  isLoading = false;

  errors: string;
  userRoles: UserRole[];
  showUserRoleDetails = false;
  selected: UserRole;
  currentRole: UserRole;
  showDeleteConf: boolean;

  constructor(private auth: AuthService,
    private userRoleService: UserRoleService, private toast: ToastrService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.getUserRoles();
  }


  getUserRoles() {
    this.isLoading = true;
    this.userRoleService.getAll().subscribe(
      results => {
        this.userRoles = results['userRoles'];
        this.isLoading = false;
      },
      errors => {
        this.toast.error('Oops something went wrong', 'Error');
        console.log('Error', errors);
        this.isLoading = false;
      });
  }

  add() {
    const userRole = {
      id: 0,
      name: '',
      maxReservationPeriod: 1,
      maxReservationsPerDay: 1,
      maxReservationsPerPeriod: 1,
      isAdmin: false,
      canUseRecurring: false,
      class: 1,
      FacilityId: this.auth.userFacility.id
    };

    this.currentRole = userRole;
    this.showUserRoleDetails = true;

  }

  edit() {

    this.currentRole = this.selected;
    this.showUserRoleDetails = true;
  }

  saveUserRole(userRole: UserRole) {

    if (userRole.id === 0) {
      this.userRoleService.create(userRole).subscribe(
        res => {
          this.toast.success('New role has been added', 'Success');
        }, error => {
          this.toast.error('Oops something went wrong', 'Error');
          console.log('Error', error);
        }
      );
    } else {
      this.userRoleService.update(userRole.id, userRole).subscribe(
        res => {

          const results: ApiMessage = res;
          if (results.success === true) {
            this.toast.success(results.message, 'Success');
            this.isLoading = true;
            this.getUserRoles();
            this.showUserRoleDetails = false;
          } else {
            this.toast.error(results.message, 'Something Went Wrong');
            console.log('Error', results);
          }
        }, error => {
          this.toast.error('Oops something went wrong', 'Error');
          console.log('Error ', error);
        }

      );
    }


  }

  confirmDelete() {
    this.showDeleteConf = true;
  }

  delete() {
    this.showDeleteConf = false;
  }


  // handle the cancel from the user role details component
  cancel() {
    this.showUserRoleDetails = false;
  }

}
