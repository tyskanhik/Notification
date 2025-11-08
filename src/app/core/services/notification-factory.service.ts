import { Injectable } from '@angular/core';
import { Notification, NotificationType, createNotification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationFactoryService {
  
  createNotification(
    type: NotificationType, 
    title: string, 
    message: string, 
    duration?: number,
    groupKey?: string
  ): Notification {
    return createNotification(type, title, message, duration, groupKey);
  }
}