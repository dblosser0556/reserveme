import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import { AppComponent } from './components/app/app.component';
import { ClarityModule } from '@clr/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InMemoryDataService } from './services/inmemory.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessagesComponent } from './components/messages/messages.component';
import { HomeComponent, LoginFormComponent, HeaderComponent } from './components';
import { routing } from './app.routing';
import { MemberService } from './services';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CalendarHeaderComponent } from './components/calendar-header/calendar-header.component';
import { CalendarDayTabsComponent } from './components/calendar-day-tabs/calendar-day-tabs.component';

@NgModule({
  declarations: [
    AppComponent,
    MessagesComponent,
    HomeComponent,
    LoginFormComponent,
    HeaderComponent,
    PageNotFoundComponent,
    CalendarHeaderComponent,
    CalendarDayTabsComponent
  ],
  imports: [
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService),
    BrowserModule,
    ClarityModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    routing
  ],
  providers: [MemberService],
  bootstrap: [AppComponent]
})
export class AppModule { }
