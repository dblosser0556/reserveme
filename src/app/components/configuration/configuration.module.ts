import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { configurationRouting } from './configuration.routing';


import {
  RootComponent,
  RegisterUserComponent,
  RoleComponent,
  FacilityInfoComponent
} from '.';

import { UserComponent } from './user/user.component';
import { ResourceComponent } from './resource/resource.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ClarityModule,
    ClrFormsNextModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    configurationRouting
  ],
  declarations: [
    RootComponent,
    RegisterUserComponent,
    RoleComponent,
    FacilityInfoComponent,
    UserComponent,
    ResourceComponent
  ],

  exports: [RootComponent]
})
export class ConfigurationModule { }

