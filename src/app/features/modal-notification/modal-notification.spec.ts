import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalNotification } from './modal-notification';
import { Notification, NotificationType } from '../../core/models/notification.model';

describe('ModalNotificationComponent', () => {
  let component: ModalNotification;
  let fixture: ComponentFixture<ModalNotification>;

  const mockNotification: Notification = {
    id: 'modal-test-id-123',
    type: NotificationType.WARNING,
    title: 'Модальное уведомление',
    message: 'Это тестовое модальное уведомление',
    duration: 3000,
    groupKey: 'modal-group'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNotification]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalNotification);
    component = fixture.componentInstance;
  });

  it('должен корректно принимать и отображать данные уведомления', () => {
    fixture.componentRef.setInput('notification', mockNotification);
    fixture.detectChanges();

    const notification = component.notification();
    expect(notification).toEqual(mockNotification);
    expect(notification.id).toBe('modal-test-id-123');
    expect(notification.title).toBe('Модальное уведомление');
    expect(notification.message).toBe('Это тестовое модальное уведомление');
  });

  describe('должен корректно обрабатывать все типы уведомлений', () => {
    it('для успешного уведомления (SUCCESS)', () => {
      const successNotification: Notification = {
        ...mockNotification,
        type: NotificationType.SUCCESS,
        title: 'Успешная операция'
      };
      
      fixture.componentRef.setInput('notification', successNotification);
      fixture.detectChanges();

      expect(component.notification().type).toBe(NotificationType.SUCCESS);
      expect(component.notification().title).toBe('Успешная операция');
    });

    it('для предупреждающего уведомления (WARNING)', () => {
      const warningNotification: Notification = {
        ...mockNotification,
        type: NotificationType.WARNING,
        title: 'Внимание'
      };
      
      fixture.componentRef.setInput('notification', warningNotification);
      fixture.detectChanges();

      expect(component.notification().type).toBe(NotificationType.WARNING);
      expect(component.notification().title).toBe('Внимание');
    });

    it('для уведомления об ошибке (ERROR)', () => {
      const errorNotification: Notification = {
        ...mockNotification,
        type: NotificationType.ERROR,
        title: 'Ошибка',
        message: 'Произошла критическая ошибка'
      };
      
      fixture.componentRef.setInput('notification', errorNotification);
      fixture.detectChanges();

      expect(component.notification().type).toBe(NotificationType.ERROR);
      expect(component.notification().title).toBe('Ошибка');
      expect(component.notification().message).toBe('Произошла критическая ошибка');
    });
  });

  it('должен эмитить событие onClose при закрытии модального окна', () => {
    fixture.componentRef.setInput('notification', mockNotification);
    fixture.detectChanges();

    let closeEventEmitted = false;

    component.onClose.subscribe(() => {
      closeEventEmitted = true;
    });
    component.onClose.emit();

    expect(closeEventEmitted).toBeTrue();
  });

  it('должен работать с уведомлением без опциональных полей', () => {
    const minimalNotification: Notification = {
      id: 'minimal-modal-id',
      type: NotificationType.SUCCESS,
      title: 'Минимальное уведомление',
      message: 'Сообщение без дополнительных параметров'
      // duration и groupKey отсутствуют
    };

    fixture.componentRef.setInput('notification', minimalNotification);
    fixture.detectChanges();

    const notification = component.notification();
    
    expect(notification.id).toBe('minimal-modal-id');
    expect(notification.duration).toBeUndefined();
    expect(notification.groupKey).toBeUndefined();
    expect(notification.title).toBe('Минимальное уведомление');
    expect(notification.message).toBe('Сообщение без дополнительных параметров');
  });
});