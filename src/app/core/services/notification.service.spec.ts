import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { NotificationFactoryService } from './notification-factory.service';
import { DelayedDeliveryService } from './delayed-delivery.service';
import { Notification, NotificationType } from '../models/notification.model';

describe('NotificationService', () => {
  let service: NotificationService;
  let factorySpy: jasmine.SpyObj<NotificationFactoryService>;
  let delayedSpy: jasmine.SpyObj<DelayedDeliveryService>;

  beforeEach(() => {
    const factoryMock = jasmine.createSpyObj('NotificationFactoryService', ['createNotification']);
    const delayedMock = jasmine.createSpyObj('DelayedDeliveryService', ['deliverWithDelay']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationFactoryService, useValue: factoryMock },
        { provide: DelayedDeliveryService, useValue: delayedMock }
      ]
    });

    service = TestBed.inject(NotificationService);
    factorySpy = TestBed.inject(NotificationFactoryService) as jasmine.SpyObj<NotificationFactoryService>;
    delayedSpy = TestBed.inject(DelayedDeliveryService) as jasmine.SpyObj<DelayedDeliveryService>;
  });

  it('должен создавать toast уведомление', fakeAsync(async () => {
    const mockNotification: Notification = { 
      id: 'test-1', 
      type: 'success', 
      title: 'Тест', 
      message: 'Тестовое сообщение' 
    };
    factorySpy.createNotification.and.returnValue(mockNotification);

    await service.showNotification('success', 'Тест', 'Тестовое сообщение', 'toast');
    tick();

    expect(factorySpy.createNotification).toHaveBeenCalledWith(
      'success', 
      'Тест', 
      'Тестовое сообщение', 
      undefined
    );
    
    const toasts = service.getToasts();
    expect(toasts().length).toBe(1);
    expect(toasts()[0].id).toBe('test-1');
  }));

  it('должен группировать одинаковые toast уведомления', fakeAsync(async () => {
    const mockNotification: Notification = { 
      id: 'grouped-1', 
      type: 'success', 
      title: 'Групповое уведомление', 
      message: 'Тестовое сообщение' 
    };
    factorySpy.createNotification.and.returnValue(mockNotification);

    await service.showNotification('success', 'Групповое уведомление', 'Тестовое сообщение', 'toast', { grouped: true });
    await service.showNotification('success', 'Групповое уведомление', 'Тестовое сообщение', 'toast', { grouped: true });
    tick();

    expect(factorySpy.createNotification).toHaveBeenCalledTimes(1);
    
    const toasts = service.getToasts();
    expect(toasts().length).toBe(1);
    expect(toasts()[0].title).toContain('(2)');
  }));

  it('должен использовать отложенную доставку при указании задержки', fakeAsync(async () => {
    const mockNotification: Notification = { 
      id: 'delayed-1', 
      type: 'warning', 
      title: 'Уведомление с задержкой', 
      message: 'Сообщение появится через 1 секунду' 
    };
    factorySpy.createNotification.and.returnValue(mockNotification);
    delayedSpy.deliverWithDelay.and.returnValue(Promise.resolve());

    await service.showNotification('warning', 'Уведомление с задержкой', 'Сообщение появится через 1 секунду', 'toast', { 
      delayed: 1000 
    });

    expect(delayedSpy.deliverWithDelay).toHaveBeenCalledWith(
      mockNotification, 
      1000, 
      jasmine.any(Function)
    );
  }));

  it('должен доставлять уведомление через toast канал', fakeAsync(async () => {
    const mockNotification: Notification = { 
      id: 'toast-1', 
      type: 'success', 
      title: 'Toast уведомление', 
      message: 'Это toast сообщение' 
    };
    factorySpy.createNotification.and.returnValue(mockNotification);

    await service.showNotification('success', 'Toast уведомление', 'Это toast сообщение', 'toast');
    tick();

    const toasts = service.getToasts();
    expect(toasts().length).toBe(1);
    expect(toasts()[0].title).toBe('Toast уведомление');
    expect(toasts()[0].type).toBe('success');
  }));

  it('должен доставлять уведомление через modal канал', fakeAsync(async () => {
    const mockNotification: Notification = { 
      id: 'modal-1', 
      type: 'error', 
      title: 'Модальное окно', 
      message: 'Это модальное сообщение' 
    };
    factorySpy.createNotification.and.returnValue(mockNotification);

    await service.showNotification('error', 'Модальное окно', 'Это модальное сообщение', 'modal');
    tick();

    const modals = service.getModals();
    expect(modals().length).toBe(1);
    expect(modals()[0].title).toBe('Модальное окно');
    expect(modals()[0].type).toBe('error');
  }));

  it('должен доставлять уведомление через alert канал', fakeAsync(async () => {
    const mockNotification: Notification = { 
      id: 'alert-1', 
      type: 'warning', 
      title: 'Браузерный Alert', 
      message: 'Это alert сообщение' 
    };
    factorySpy.createNotification.and.returnValue(mockNotification);

    const alertSpy = spyOn(window, 'alert');

    await service.showNotification('warning', 'Браузерный Alert', 'Это alert сообщение', 'alert');
    tick();

    expect(alertSpy).toHaveBeenCalled();

    const alertCall = alertSpy.calls.mostRecent();
    const alertMessage = alertCall.args[0] as string;

    expect(alertMessage).toContain('WARNING');
    expect(alertMessage).toContain('Браузерный Alert');
    expect(alertMessage).toContain('Это alert сообщение');
  }));

  it('должен автоматически удалять toast уведомление после истечения duration', fakeAsync(async () => {
    const mockNotification: Notification = { 
      id: 'auto-remove-1', 
      type: 'success', 
      title: 'Временное уведомление', 
      message: 'Исчезнет через 1 секунду' 
    };
    factorySpy.createNotification.and.returnValue(mockNotification);

    await service.showNotification('success', 'Временное уведомление', 'Исчезнет через 1 секунду', 'toast', {
      duration: 1
    });
    tick();

    let toasts = service.getToasts();
    expect(toasts().length).toBe(1);

    tick(1500);

    toasts = service.getToasts();
    expect(toasts().length).toBe(0);
  }));

  it('должен удалять toast уведомление по ID', () => {
    const mockNotification: Notification = { 
      id: 'remove-test', 
      type: 'success', 
      title: 'Удаляемое уведомление', 
      message: 'Это уведомление будет удалено' 
    };

    service['toastNotifications'].set([mockNotification]);

    service.removeToast('remove-test');

    const toasts = service.getToasts();
    expect(toasts().length).toBe(0);
  });

  it('должен удалять modal уведомление по ID', () => {
    const mockNotification: Notification = { 
      id: 'modal-remove-test', 
      type: 'error', 
      title: 'Удаляемое модальное окно', 
      message: 'Это модальное окно будет удалено' 
    };

    service['modalNotifications'].set([mockNotification]);

    service.removeModal('modal-remove-test');

    const modals = service.getModals();
    expect(modals().length).toBe(0);
  });

  it('должен корректно обрабатывать разные типы уведомлений', fakeAsync(async () => {
    const testCases: { type: NotificationType; title: string }[] = [
      { type: 'success', title: 'Успешная операция' },
      { type: 'warning', title: 'Предупреждение' },
      { type: 'error', title: 'Ошибка' }
    ];

    for (const testCase of testCases) {
      const mockNotification: Notification = { 
        id: `test-${testCase.type}`, 
        type: testCase.type, 
        title: testCase.title, 
        message: 'Тестовое сообщение' 
      };
      factorySpy.createNotification.and.returnValue(mockNotification);

      await service.showNotification(testCase.type, testCase.title, 'Тестовое сообщение', 'toast');
      tick();

      const toasts = service.getToasts();
      expect(toasts()[toasts().length - 1].type).toBe(testCase.type);
      expect(toasts()[toasts().length - 1].title).toBe(testCase.title);

      service.removeToast(`test-${testCase.type}`);
    }
  }));

  it('должен создавать разные группы для разных groupKey', fakeAsync(async () => {
    const mockNotification1: Notification = { 
      id: 'group-1', 
      type: 'success', 
      title: 'Группа 1', 
      message: 'Сообщение 1' 
    };
    const mockNotification2: Notification = { 
      id: 'group-2', 
      type: 'success', 
      title: 'Группа 2', 
      message: 'Сообщение 2' 
    };

    factorySpy.createNotification.and.returnValues(mockNotification1, mockNotification2);

    await service.showNotification('success', 'Группа 1', 'Сообщение 1', 'toast', { 
      grouped: true, 
      groupKey: 'group-1' 
    });
    await service.showNotification('success', 'Группа 2', 'Сообщение 2', 'toast', { 
      grouped: true, 
      groupKey: 'group-2' 
    });
    tick();

    expect(factorySpy.createNotification).toHaveBeenCalledTimes(2);
    
    const toasts = service.getToasts();
    expect(toasts().length).toBe(2);
  }));

  it('должен создавать отдельные уведомления при отключенной группировке', fakeAsync(async () => {
    const mockNotification1: Notification = { 
      id: 'no-group-1', 
      type: 'success', 
      title: 'Одинаковый заголовок', 
      message: 'Сообщение' 
    };
    const mockNotification2: Notification = { 
      id: 'no-group-2', 
      type: 'success', 
      title: 'Одинаковый заголовок', 
      message: 'Сообщение' 
    };
    
    factorySpy.createNotification.and.returnValues(mockNotification1, mockNotification2);

    await service.showNotification('success', 'Одинаковый заголовок', 'Сообщение', 'toast', { grouped: false });
    await service.showNotification('success', 'Одинаковый заголовок', 'Сообщение', 'toast', { grouped: false });
    tick();

    expect(factorySpy.createNotification).toHaveBeenCalledTimes(2);
    
    const toasts = service.getToasts();
    expect(toasts().length).toBe(2);
    expect(toasts()[0].title).toBe('Одинаковый заголовок');
    expect(toasts()[1].title).toBe('Одинаковый заголовок');
  }));

  it('должен корректно обрабатывать пустые заголовки и сообщения', fakeAsync(async () => {
    const mockNotification: Notification = { 
      id: 'empty-test', 
      type: 'success', 
      title: '', 
      message: '' 
    };
    factorySpy.createNotification.and.returnValue(mockNotification);

    await expectAsync(
      service.showNotification('success', '', '', 'toast')
    ).toBeResolved();
  }));
});