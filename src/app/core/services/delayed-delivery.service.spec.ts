import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DelayedDeliveryService } from './delayed-delivery.service';
import { Notification } from '../models/notification.model';

describe('DelayedDeliveryService', () => {
  let service: DelayedDeliveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DelayedDeliveryService]
    });
    service = TestBed.inject(DelayedDeliveryService);
  });

  it('должен выполнять доставку после указанной задержки', fakeAsync(() => {
    const mockNotification: Notification = { 
      id: 'test-1', 
      type: 'success', 
      title: 'Тест задержки', 
      message: 'Сообщение' 
    };
    const deliveryFn = jasmine.createSpy('deliveryFn');

    service.deliverWithDelay(mockNotification, 100, deliveryFn);
    
    expect(deliveryFn).not.toHaveBeenCalled();
    tick(50);
    expect(deliveryFn).not.toHaveBeenCalled();
    tick(50);
    
    expect(deliveryFn).toHaveBeenCalledOnceWith(mockNotification);
  }));

  it('должен выполнять доставку сразу при нулевой задержке', fakeAsync(() => {
    const mockNotification: Notification = { 
      id: 'test-2', 
      type: 'warning', 
      title: 'Без задержки', 
      message: 'Сообщение' 
    };
    const deliveryFn = jasmine.createSpy('deliveryFn');

    service.deliverWithDelay(mockNotification, 0, deliveryFn);
    tick(0);

    expect(deliveryFn).toHaveBeenCalledOnceWith(mockNotification);
  }));
});