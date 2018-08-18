import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../guard/auth.guard';
import {
    RootComponent,
    RegisterUserComponent,
    RoleComponent,
    FacilityInfoComponent

} from '.';





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
                        path: 'role', component: RoleComponent, data: { 'title': 'Configure Member Roles', 'breadcrumb': 'Roles' },
                    },
                    { path: 'register', component: RegisterUserComponent,
                        data: { 'title': 'Register New Users', 'breadcrumb': 'Register' } },
                        { path: 'register', component: FacilityInfoComponent,
                        data: { 'title': 'Update Facilty Information', 'breadcrumb': 'Facility' } },

                ]
            }
        ]
    }
]);

