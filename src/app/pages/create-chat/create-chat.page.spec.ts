import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChatPage } from './create-chat.page';

describe('CreateChatPage', () => {
  let component: CreateChatPage;
  let fixture: ComponentFixture<CreateChatPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateChatPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
