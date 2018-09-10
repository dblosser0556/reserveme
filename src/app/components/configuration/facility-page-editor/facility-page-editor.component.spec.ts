import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityPageEditorComponent } from './facility-page-editor.component';

describe('FacilityPageEditorComponent', () => {
  let component: FacilityPageEditorComponent;
  let fixture: ComponentFixture<FacilityPageEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacilityPageEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilityPageEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
