import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotification } from './modal-notification';

describe('ModalNotification', () => {
  let component: ModalNotification;
  let fixture: ComponentFixture<ModalNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
