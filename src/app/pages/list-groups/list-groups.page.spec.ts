import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListGroupsPage } from './list-groups.page';

describe('ListGroupsPage', () => {
  let component: ListGroupsPage;
  let fixture: ComponentFixture<ListGroupsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListGroupsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListGroupsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
