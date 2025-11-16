// app/app.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { NotificationService } from './core/services/notification.service';
import { NotificationContainer } from './features/notification-container/notification-container';
import { FormsModule } from '@angular/forms';
import { DelayedDeliveryService } from './core/services/delayed-delivery.service';

describe('AppComponent (Integration)', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, NotificationContainer, FormsModule],
      providers: [
        NotificationService,
        DelayedDeliveryService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    
    fixture.detectChanges();
  });

  it('должен создавать компонент и внедрять реальные сервисы', () => {
    expect(component).toBeTruthy();
    expect(notificationService).toBeTruthy();
    expect(notificationService instanceof NotificationService).toBeTrue();
  });

  it('должен отправлять уведомление через реальный NotificationService', fakeAsync(() => {
    component.form.title = 'Интеграционный тест';
    component.form.message = 'Проверка реального сервиса';
    component.form.type = 'success';
    component.form.channel = 'toast';

    const showNotificationSpy = spyOn(notificationService, 'showNotification').and.callThrough();

    component.showNotification();
    tick();

    expect(showNotificationSpy).toHaveBeenCalledWith(
      'success',
      'Интеграционный тест',
      'Проверка реального сервиса',
      'toast',
      {
        duration: 5,
        delayed: undefined,
        grouped: false
      }
    );
  }));

  it('должен добавлять уведомление в сигнал toasts', fakeAsync(() => {
    const initialToastsCount = notificationService.getToasts()().length;
    component.form.title = 'Тест сигнала';
    component.form.message = 'Сообщение';
    component.form.channel = 'toast';

    component.showNotification();
    tick();

    const toasts = notificationService.getToasts()();
    expect(toasts.length).toBe(initialToastsCount + 1);
    expect(toasts[toasts.length - 1].title).toBe('Тест сигнала');
    expect(toasts[toasts.length - 1].message).toBe('Сообщение');
  }));

  it('должен использовать реальный DelayedDeliveryService для задержек', fakeAsync(() => {

    component.form.title = 'Тест задержки';
    component.form.message = 'Сообщение';
    component.form.delay = 1;

    const delayedService = TestBed.inject(DelayedDeliveryService);
    const deliverWithDelaySpy = spyOn(delayedService, 'deliverWithDelay').and.callThrough();

    component.showNotification();
    tick();

    expect(deliverWithDelaySpy).toHaveBeenCalled();
    
    const callArgs = deliverWithDelaySpy.calls.mostRecent().args;
    expect(callArgs[1]).toBe(1000);
    expect(callArgs[0].title).toBe('Тест задержки');
  }));

  it('должен очищать форму', () => {
    component.form.title = 'Уведомление до очистки';
    component.form.message = 'Сообщение';
    component.showNotification();

    const toastsBeforeClear = notificationService.getToasts()().length;

    component.clearForm();

    expect(notificationService.getToasts()().length).toBe(toastsBeforeClear);
    expect(component.form.title).toBe('');
    expect(component.form.message).toBe('');
  });

  it('должен обновлять доступность функций при изменении канала', () => {
    expect(component.isGroupingAvailable).toBeTrue();
    expect(component.isDurationAvailable).toBeTrue();

    component.form.channel = 'modal';
    component.onChannelChange();

    expect(component.isGroupingAvailable).toBeFalse();
    expect(component.isDurationAvailable).toBeFalse();
    expect(component.form.grouped).toBeFalse();
    expect(component.form.duration).toBe(0);

    component.form.channel = 'toast';
    expect(component.isGroupingAvailable).toBeTrue();
    expect(component.isDurationAvailable).toBeTrue();
  });

  it('должен создавать несколько уведомлений при демо группировки', fakeAsync(() => {
    const showNotificationSpy = spyOn(notificationService, 'showNotification').and.callThrough();

    component.showGroupedExample();
    tick(2000);

    expect(showNotificationSpy).toHaveBeenCalledTimes(3);

    expect(component.form.type).toBe('success');
    expect(component.form.title).toBe('Новое сообщение');
    expect(component.form.grouped).toBeTrue();
  }));

  it('должен передавать уведомления в NotificationContainer', fakeAsync(() => {
    component.form.title = 'Для контейнера';
    component.form.message = 'Сообщение';
    component.form.channel = 'toast';

    component.showNotification();
    tick();

    const toasts = notificationService.getToasts()();
    const lastToast = toasts[toasts.length - 1];
    
    expect(lastToast.title).toBe('Для контейнера');
    expect(lastToast.message).toBe('Сообщение');
  }));
});