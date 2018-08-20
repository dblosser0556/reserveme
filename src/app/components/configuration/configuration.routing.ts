import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../guard/auth.guard';
import {
    RootComponent,
    RegisterUserComponent,
    RoleComponent,
    FacilityInfoComponent,
    ResourceComponent,
    UserComponent

} from '.';
import { UserDetailComponent } from '../user-detail/user-detail.component';





export const configurationRouting: ModuleWithProviders = RouterModule.forChild([
    {
        path: 'configuration',
        component: RootComponent,
        canActivate: [AuthGuard],
        data: { 'title': 'root', 'breadcrumb': 'Configuration' },

        children: [
            {
                path: '',
                data: { 'breadcrumb': '' },
                children: [
                    {
                        path: 'role', component: RoleComponent,
                        data: { 'title': 'Configure Member Roles', 'breadcrumb': 'Roles' },
                    },
                    {
                        path: 'register', component: RegisterUserComponent,
                        data: { 'title': 'Register New Users', 'breadcrumb': 'Register' }
                    },
                    {
                        path: 'facility', component: FacilityInfoComponent,
                        data: { 'title': 'Update Facilty Information', 'breadcrumb': 'Facility' }
                    },
                    {
                        path: 'users', component: UserComponent,
                        data: { 'breadcrumb': '' }
                    },

                    {
                        path: 'userdetails', component: UserDetailComponent,
                        data: { 'title': 'Edit or Create User', 'breadcrumb': 'User Detail' }
                    },



                    {
                        path: 'resource', component: ResourceComponent,
                        data: { 'title': 'Update Facilty Resource Information', 'breadcrumb': 'Resource' }
                    },

                ]
            }
        ]
    }
]);

