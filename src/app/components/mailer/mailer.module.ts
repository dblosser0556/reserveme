import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { MailerComponent } from './mailer.component';
import { QuillModule } from 'ngx-quill';
import { MultiEmailValidator} from '../../directives/multi-email-validator.directive';

@NgModule({
  imports: [
    CommonModule,
    QuillModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ClarityModule,
    ClrFormsNextModule
  ],
  declarations: [
    MailerComponent,
    MultiEmailValidator
  ],
  exports: [
    MailerComponent
  ]
})
export class MailerModule { }
