import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserDetailComponent } from './user-detail.component';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ClarityModule,
    ClrFormsNextModule,
    ReactiveFormsModule,
    BrowserAnimationsModule

  ],
  declarations: [UserDetailComponent],
  exports: [UserDetailComponent]
})
export class UserDetailModule { }
