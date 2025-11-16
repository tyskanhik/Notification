import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastNotification } from './toast-notification';
import { Notification, NotificationType } from '../../core/models/notification.model';

describe('ToastNotificationComponent', () => {
  let component: ToastNotification;
  let fixture: ComponentFixture<ToastNotification>;

  const mockNotification: Notification = {
    id: 'test-id-123',
    type: NotificationType.SUCCESS,
    title: 'Тестовый заголовок',
    message: 'Тестовое сообщение',
    duration: 5000,
    groupKey: 'test-group'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastNotification]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastNotification);
    component = fixture.componentInstance;
  });

  it('должен корректно отображать переданное уведомление', () => {
    fixture.componentRef.setInput('notification', mockNotification);
    
    fixture.detectChanges();

    expect(component.notification()).toEqual(mockNotification);
  });

  describe('должен обрабатывать разные типы уведомлений', () => {
    it('для успешного уведомления', () => {
      const successNotification: Notification = {
        ...mockNotification,
        type: NotificationType.SUCCESS
      };
      
      fixture.componentRef.setInput('notification', successNotification);
      fixture.detectChanges();

      expect(component.notification().type).toBe(NotificationType.SUCCESS);
    });

    it('для предупреждающего уведомления', () => {
      const warningNotification: Notification = {
        ...mockNotification,
        type: NotificationType.WARNING
      };
      
      fixture.componentRef.setInput('notification', warningNotification);
      fixture.detectChanges();

      expect(component.notification().type).toBe(NotificationType.WARNING);
    });

    it('для уведомления об ошибке', () => {
      const errorNotification: Notification = {
        ...mockNotification,
        type: NotificationType.ERROR
      };
      
      fixture.componentRef.setInput('notification', errorNotification);
      fixture.detectChanges();

      expect(component.notification().type).toBe(NotificationType.ERROR);
    });
  });

  it('должен эмитить событие onClose при закрытии', () => {
    let closeEventEmitted = false;
    
    fixture.componentRef.setInput('notification', mockNotification);
    fixture.detectChanges();

    component.onClose.subscribe(() => {
      closeEventEmitted = true;
    });

    component.onClose.emit();

    expect(closeEventEmitted).toBeTrue();
  });

  it('должен обрабатывать уведомление без опциональных полей', () => {
    const minimalNotification: Notification = {
      id: 'minimal-id',
      type: NotificationType.SUCCESS,
      title: 'Минимальный заголовок',
      message: 'Минимальное сообщение'
      // duration и groupKey отсутствуют
    };

    fixture.componentRef.setInput('notification', minimalNotification);
    fixture.detectChanges();

    expect(component.notification().id).toBe('minimal-id');
    expect(component.notification().duration).toBeUndefined();
    expect(component.notification().groupKey).toBeUndefined();
  });
});