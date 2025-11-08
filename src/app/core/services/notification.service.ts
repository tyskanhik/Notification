import { Injectable, inject, signal } from '@angular/core';
import { Notification, NotificationType } from '../models/notification.model';
import { NotificationFactoryService } from './notification-factory.service';
import { DelayedDeliveryService } from './delayed-delivery.service';

export type DeliveryChannel = 'toast' | 'modal' | 'alert';

export interface DeliveryOptions {
  delayed?: number;    // Задержка перед ПОКАЗОМ (ms)
  grouped?: boolean;   // Группировка уведомлений (только для toast)
  groupKey?: string;   // Ключ группировки (только для toast)
  duration?: number;   // Время жизни уведомления (seconds)
}

interface ToastGroup {
  notification: Notification;
  count: number;
  timer?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private factory = inject(NotificationFactoryService);
  private delayedDelivery = inject(DelayedDeliveryService);
  
  private toastNotifications = signal<Notification[]>([]);
  private modalNotifications = signal<Notification[]>([]);
  private groupedToasts = signal<Map<string, ToastGroup>>(new Map());

  async showNotification(
    type: NotificationType,
    title: string,
    message: string,
    channel: DeliveryChannel = 'toast',
    options: DeliveryOptions = {}
  ): Promise<void> {
    
    // Обработка группировки (только для toast)
    if (options.grouped && channel === 'toast') {
      await this.handleGroupedToast(type, title, message, options);
      return;
    }

    // Обычная доставка
    await this.deliverStandardNotification(type, title, message, channel, options);
  }

  private async handleGroupedToast(
    type: NotificationType,
    title: string,
    message: string,
    options: DeliveryOptions
  ): Promise<void> {
    
    const groupKey = options.groupKey || this.generateGroupKey(type, title);
    const existingGroup = this.getGroup(groupKey);

    if (existingGroup) {
      this.updateGroupCount(existingGroup, type, title, message, options);
    } else {
      await this.createNewGroup(type, title, message, groupKey, options);
    }

    if (options.delayed) {
      await this.delay(options.delayed);
    }
  }

  private updateGroupCount(
    group: ToastGroup,
    type: NotificationType,
    title: string,
    message: string,
    options: DeliveryOptions
  ): void {
    group.count++;

    const updatedNotification: Notification = {
      ...group.notification,
      type,
      title: `${title} (${group.count})`,
      message,
      duration: options.duration
    };

    group.notification = updatedNotification;
    this.updateGroupInStore(group);
    this.replaceToastInList(updatedNotification);
  }

  private async createNewGroup(
    type: NotificationType,
    title: string,
    message: string,
    groupKey: string,
    options: DeliveryOptions
  ): Promise<void> {
    
    const notification = this.factory.createNotification(type, title, message, options.duration);
    
    const newGroup: ToastGroup = {
      notification,
      count: 1
    };

    if (options.duration && options.duration > 0) {
      newGroup.timer = this.setGroupAutoRemove(groupKey, options.duration);
    }

    this.addGroupToStore(groupKey, newGroup);
    this.addToastToList(notification);
  }

  private async deliverStandardNotification(
    type: NotificationType,
    title: string,
    message: string,
    channel: DeliveryChannel,
    options: DeliveryOptions
  ): Promise<void> {
    
    const notification = this.factory.createNotification(type, title, message, options.duration);

    if (options.delayed) {
      await this.delayedDelivery.deliverWithDelay(
        notification, 
        options.delayed, 
        () => this.deliverToChannel(notification, channel, options.duration)
      );
    } else {
      this.deliverToChannel(notification, channel, options.duration);
    }
  }

  private deliverToChannel(notification: Notification, channel: DeliveryChannel, duration?: number): void {
    switch (channel) {
      case 'toast':
        this.showToast(notification, duration);
        break;
      case 'modal':
        this.showModal(notification);
        break;
      case 'alert':
        this.showAlert(notification);
        break;
    }
  }

  private showToast(notification: Notification, duration?: number): void {
    this.toastNotifications.update(toasts => [...toasts, notification]);
    
    if (duration && duration > 0) {
      setTimeout(() => this.removeToast(notification.id), duration * 1000);
    }
  }

  private showModal(notification: Notification): void {
    this.modalNotifications.update(modals => [...modals, notification]);
  }

  private showAlert(notification: Notification): void {
    const emoji = this.getTypeEmoji(notification.type);
    alert(`${emoji} ${notification.type.toUpperCase()}\n\n${notification.title}\n\n${notification.message}`);
  }
  private getGroup(groupKey: string): ToastGroup | undefined {
    return this.groupedToasts().get(groupKey);
  }

  private addGroupToStore(groupKey: string, group: ToastGroup): void {
    this.groupedToasts.update(groups => new Map(groups.set(groupKey, group)));
  }

  private updateGroupInStore(group: ToastGroup): void {
    this.groupedToasts.update(groups => new Map(groups));
  }

  private addToastToList(notification: Notification): void {
    this.toastNotifications.update(toasts => [...toasts, notification]);
  }

  private replaceToastInList(updatedNotification: Notification): void {
    this.toastNotifications.update(toasts => 
      toasts.map(toast => toast.id === updatedNotification.id ? updatedNotification : toast)
    );
  }

  private setGroupAutoRemove(groupKey: string, duration: number): number {
    return setTimeout(() => this.removeGroup(groupKey), duration * 1000);
  }

  private removeGroup(groupKey: string): void {
    const group = this.getGroup(groupKey);
    if (!group) return;

    this.clearGroupTimer(group);
    this.removeToast(group.notification.id);
    
    this.groupedToasts.update(groups => {
      groups.delete(groupKey);
      return new Map(groups);
    });
  }

  private clearGroupTimer(group: ToastGroup): void {
    if (group.timer) {
      clearTimeout(group.timer);
    }
  }

  private generateGroupKey(type: NotificationType, title: string): string {
    return `toast-${type}-${title.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private getTypeEmoji(type: NotificationType): string {
    const emojis = {
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return emojis[type];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getToasts() {
    return this.toastNotifications.asReadonly();
  }

  getModals() {
    return this.modalNotifications.asReadonly();
  }

  removeToast(id: string): void {
    this.clearGroupTimerForNotification(id);
    
    this.toastNotifications.update(toasts => toasts.filter(t => t.id !== id));
  }

  removeModal(id: string): void {
    this.modalNotifications.update(modals => modals.filter(m => m.id !== id));
  }

  private clearGroupTimerForNotification(notificationId: string): void {
    const groups = this.groupedToasts();
    
    for (const [groupKey, group] of groups.entries()) {
      if (group.notification.id === notificationId) {
        this.clearGroupTimer(group);
        groups.delete(groupKey);
        this.groupedToasts.set(new Map(groups));
        break;
      }
    }
  }
}