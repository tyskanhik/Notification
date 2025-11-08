import { Injectable } from '@angular/core';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class DelayedDeliveryService {
  
  async deliverWithDelay(
    notification: Notification, 
    delayMs: number, 
    deliveryFn: (notification: Notification) => void
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    deliveryFn(notification);
  }
}