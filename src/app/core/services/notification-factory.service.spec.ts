import { TestBed } from '@angular/core/testing';
import { NotificationFactoryService } from './notification-factory.service';

describe('NotificationFactoryService', () => {
  let service: NotificationFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationFactoryService]
    });
    service = TestBed.inject(NotificationFactoryService);
  });

  it('должен создавать уведомление с правильной структурой', () => {
    const type = 'success';
    const title = 'Заголовок';
    const message = 'Сообщение';
    const duration = 5;
    const groupKey = 'group-key';

    const notification = service.createNotification(type, title, message, duration, groupKey);

    expect(notification.id).toBeDefined();
    expect(notification.type).toBe('success');
    expect(notification.title).toBe('Заголовок');
    expect(notification.message).toBe('Сообщение');
    expect(notification.duration).toBe(5);
    expect(notification.groupKey).toBe('group-key');
  });

  it('должен генерировать уникальные ID', () => {
    const notification1 = service.createNotification('success', 'Тест1', 'Сообщение1');
    const notification2 = service.createNotification('error', 'Тест2', 'Сообщение2');

    expect(notification1.id).not.toBe(notification2.id);
  });

  it('должен создавать уведомление без duration и groupKey когда не переданы', () => {
    const notification = service.createNotification('success', 'Тест', 'Сообщение');
    
    expect(notification.duration).toBeUndefined();
    expect(notification.groupKey).toBeUndefined();
  });
});