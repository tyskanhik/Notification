import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NotificationContainer } from "./features/notification-container/notification-container";
import { NotificationService } from './core/services/notification.service';
import { DeliveryChannel, NotificationType } from './core/models/notification.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private notificationService = inject(NotificationService);
  
  form = {
    type: 'success' as NotificationType,
    channel: 'toast' as DeliveryChannel,
    title: '',
    message: '',
    duration: 5,
    delay: 0,
    grouped: false
  };

  get isGroupingAvailable(): boolean {
    return this.form.channel === 'toast';
  }

  get isDurationAvailable(): boolean {
    return this.form.channel === 'toast';
  }

  onChannelChange(): void {
    if (!this.isGroupingAvailable) {
      this.form.grouped = false;
    }

    if (!this.isDurationAvailable) {
      this.form.duration = 0;
    }
  }

  async showNotification(): Promise<void> {
    const options = {
      duration: this.isDurationAvailable ? (this.form.duration || undefined) : undefined,
      delayed: this.form.delay ? this.form.delay * 1000 : undefined,
      grouped: this.isGroupingAvailable ? this.form.grouped : false
    };

    await this.notificationService.showNotification(
      this.form.type,
      this.form.title,
      this.form.message,
      this.form.channel,
      options
    );
  }

  async showGroupedExample(): Promise<void> {
    this.form.type = 'success';
    this.form.title = 'Новое сообщение';
    this.form.message = 'У вас новое уведомление';
    this.form.duration = 10;
    this.form.grouped = true;

    for (let i = 1; i <= 3; i++) {
      await this.notificationService.showNotification(
        this.form.type,
        this.form.title,
        this.form.message,
        this.form.channel,
        {
          grouped: true,
          duration: this.form.duration
        }
      );
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  clearForm(): void {
    this.form.title = '';
    this.form.message = '';
    this.form.duration = 5;
    this.form.delay = 0;
    this.form.grouped = false;
  }
}
