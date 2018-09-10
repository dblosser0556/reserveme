import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { configurationRouting } from './configuration.routing';
import { MailerModule } from '../mailer/mailer.module';
import { QuillModule } from 'ngx-quill';

import {
  RootComponent,
  RegisterUserComponent,
  RoleComponent,
  FacilityInfoComponent
} from '.';

import { UserComponent } from './user/user.component';
import { ResourceComponent } from './resource/resource.component';
import { RoleDetailComponent } from './role/role-detail/role-detail.component';
import { FacilityPageEditorComponent } from './facility-page-editor/facility-page-editor.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ClarityModule,
    ClrFormsNextModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    configurationRouting,
    MailerModule,
    QuillModule
  ],
  declarations: [
    RootComponent,
    RegisterUserComponent,
    RoleComponent,
    FacilityInfoComponent,
    UserComponent,
    ResourceComponent,
    RoleDetailComponent,
    FacilityPageEditorComponent
  ],

  exports: [RootComponent]
})
export class ConfigurationModule { }

