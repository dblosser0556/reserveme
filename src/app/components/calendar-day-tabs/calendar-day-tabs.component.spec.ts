import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarDayTabsComponent } from './calendar-day-tabs.component';

describe('CalendarDayTabsComponent', () => {
  let component: CalendarDayTabsComponent;
  let fixture: ComponentFixture<CalendarDayTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarDayTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarDayTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
