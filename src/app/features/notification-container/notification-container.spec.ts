import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationContainer } from './notification-container';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';

describe('NotificationContainerComponent Integration', () => {
  let component: NotificationContainer;
  let fixture: ComponentFixture<NotificationContainer>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationContainer],
      providers: [NotificationService]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationContainer);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    
    fixture.detectChanges();
  });

  afterEach(() => {
    notificationService['toastNotifications'].set([]);
    notificationService['modalNotifications'].set([]);
    notificationService['groupedToasts'].set(new Map());
  });

  it('должен отображать toast уведомления из сервиса', fakeAsync(() => {
    const mockToasts: Notification[] = [
      {
        id: 'toast-1',
        type: 'success',
        title: 'Успешная операция',
        message: 'Данные успешно сохранены'
      },
      {
        id: 'toast-2', 
        type: 'warning',
        title: 'Предупреждение',
        message: 'Проверьте настройки'
      }
    ];
    notificationService['toastNotifications'].set(mockToasts);
    fixture.detectChanges();

    const toastElements = fixture.nativeElement.querySelectorAll('app-toast-notification');
    expect(toastElements.length).toBe(2);
    
    const firstToast = toastElements[0];
    const secondToast = toastElements[1];
    
    expect(firstToast.textContent).toContain('Успешная операция');
    expect(firstToast.textContent).toContain('Данные успешно сохранены');
    expect(secondToast.textContent).toContain('Предупреждение');
    expect(secondToast.textContent).toContain('Проверьте настройки');
  }));

  it('должен отображать modal уведомления из сервиса', () => {
    const mockModals: Notification[] = [{
      id: 'modal-1',
      type: 'error',
      title: 'Критическая ошибка',
      message: 'Не удалось подключиться к серверу'
    }];

    notificationService['modalNotifications'].set(mockModals);
    fixture.detectChanges();

    const modalElements = fixture.nativeElement.querySelectorAll('app-modal-notification');
    expect(modalElements.length).toBe(1);
    
    const modalElement = modalElements[0];
    expect(modalElement.textContent).toContain('Критическая ошибка');
    expect(modalElement.textContent).toContain('Не удалось подключиться к серверу');
  });

  it('должен автоматически удалять toast уведомление после истечения времени', fakeAsync(async () => {
    const testTitle = 'Временное уведомление';
    const testMessage = 'Исчезнет через 1 секунду';

    await notificationService.showNotification(
      'success', 
      testTitle, 
      testMessage, 
      'toast', 
      { duration: 1 }
    );
    fixture.detectChanges();

    let toastElements = fixture.nativeElement.querySelectorAll('app-toast-notification');
    expect(toastElements.length).toBe(1);
    expect(toastElements[0].textContent).toContain(testTitle);

    tick(1500);

    fixture.detectChanges();
    toastElements = fixture.nativeElement.querySelectorAll('app-toast-notification');
    expect(toastElements.length).toBe(0);
  }));

  it('должен удалять toast уведомление при вызове removeToast', () => {
    const toastToRemove: Notification = {
      id: 'manual-remove-toast',
      type: 'warning',
      title: 'Уведомление для удаления',
      message: 'Будет удалено вручную'
    };

    notificationService['toastNotifications'].set([toastToRemove]);
    fixture.detectChanges();

    let toastElements = fixture.nativeElement.querySelectorAll('app-toast-notification');
    expect(toastElements.length).toBe(1);

    component.removeToast('manual-remove-toast');
    fixture.detectChanges();

    toastElements = fixture.nativeElement.querySelectorAll('app-toast-notification');
    expect(toastElements.length).toBe(0);
  });

  it('должен удалять modal уведомление при вызове removeModal', () => {
    const modalToRemove: Notification = {
      id: 'manual-remove-modal',
      type: 'error',
      title: 'Модальное окно для удаления',
      message: 'Будет закрыто вручную'
    };

    notificationService['modalNotifications'].set([modalToRemove]);
    fixture.detectChanges();

    let modalElements = fixture.nativeElement.querySelectorAll('app-modal-notification');
    expect(modalElements.length).toBe(1);

    component.removeModal('manual-remove-modal');
    fixture.detectChanges();

    modalElements = fixture.nativeElement.querySelectorAll('app-modal-notification');
    expect(modalElements.length).toBe(0);
  });

  it('должен вызывать сервис при удалении toast уведомления', () => {
    const removeToastSpy = spyOn(notificationService, 'removeToast');

    component.removeToast('test-toast-id');

    expect(removeToastSpy).toHaveBeenCalledOnceWith('test-toast-id');
  });

  it('должен вызывать сервис при удалении modal уведомления', () => {
    const removeModalSpy = spyOn(notificationService, 'removeModal');

    component.removeModal('test-modal-id');

    expect(removeModalSpy).toHaveBeenCalledOnceWith('test-modal-id');
  });

  it('должен одновременно отображать toast и modal уведомления', () => {
    const mockToasts: Notification[] = [{
      id: 'toast-1',
      type: 'success',
      title: 'Toast уведомление',
      message: 'Сообщение в toast'
    }];

    const mockModals: Notification[] = [{
      id: 'modal-1',
      type: 'error',
      title: 'Modal уведомление',
      message: 'Сообщение в modal'
    }];

    notificationService['toastNotifications'].set(mockToasts);
    notificationService['modalNotifications'].set(mockModals);
    fixture.detectChanges();

    const toastElements = fixture.nativeElement.querySelectorAll('app-toast-notification');
    const modalElements = fixture.nativeElement.querySelectorAll('app-modal-notification');
    
    expect(toastElements.length).toBe(1);
    expect(modalElements.length).toBe(1);
    
    expect(toastElements[0].textContent).toContain('Toast уведомление');
    expect(modalElements[0].textContent).toContain('Modal уведомление');
  });

  it('должен обновлять UI при изменении данных в сервисе', () => {
    const initialToasts: Notification[] = [{
      id: 'dynamic-toast',
      type: 'success',
      title: 'Первая версия',
      message: 'Исходное сообщение'
    }];

    notificationService['toastNotifications'].set(initialToasts);
    fixture.detectChanges();

    let toastElement = fixture.nativeElement.querySelector('app-toast-notification');
    expect(toastElement.textContent).toContain('Первая версия');

    const updatedToasts: Notification[] = [{
      id: 'dynamic-toast',
      type: 'warning',
      title: 'Обновленная версия',
      message: 'Обновленное сообщение'
    }];

    notificationService['toastNotifications'].set(updatedToasts);
    fixture.detectChanges();

    toastElement = fixture.nativeElement.querySelector('app-toast-notification');
    expect(toastElement.textContent).toContain('Обновленная версия');
    expect(toastElement.textContent).not.toContain('Первая версия');
  });

  it('должен корректно обрабатывать пустое состояние', () => {
    fixture.detectChanges();

    const toastElements = fixture.nativeElement.querySelectorAll('app-toast-notification');
    const modalElements = fixture.nativeElement.querySelectorAll('app-modal-notification');
    
    expect(toastElements.length).toBe(0);
    expect(modalElements.length).toBe(0);
  });

  it('должен корректно обрабатывать множественные уведомления', () => {
    const multipleToasts: Notification[] = [
      {
        id: 'toast-1',
        type: 'success',
        title: 'Первое уведомление',
        message: 'Сообщение 1'
      },
      {
        id: 'toast-2',
        type: 'warning', 
        title: 'Второе уведомление',
        message: 'Сообщение 2'
      },
      {
        id: 'toast-3',
        type: 'error',
        title: 'Третье уведомление',
        message: 'Сообщение 3'
      }
    ];

    notificationService['toastNotifications'].set(multipleToasts);
    fixture.detectChanges();

    const toastElements = fixture.nativeElement.querySelectorAll('app-toast-notification');
    expect(toastElements.length).toBe(3);

    const toastTexts = Array.from(toastElements).map((el: unknown) => 
      (el as HTMLElement).textContent
    );
    
    expect(toastTexts.some(text => text?.includes('Первое уведомление'))).toBeTrue();
    expect(toastTexts.some(text => text?.includes('Второе уведомление'))).toBeTrue();
    expect(toastTexts.some(text => text?.includes('Третье уведомление'))).toBeTrue();
  });
});