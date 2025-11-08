import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { ModalNotification } from "../modal-notification/modal-notification";
import { ToastNotification } from "../toast-notification/toast-notification";

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [ModalNotification, ToastNotification],
  templateUrl: './notification-container.html',
  styleUrl: './notification-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationContainer {
  private notificationService = inject(NotificationService);
  
  toasts = this.notificationService.getToasts();
  modals = this.notificationService.getModals();

  removeToast(id: string): void {
    this.notificationService.removeToast(id);
  }

  removeModal(id: string): void {
    this.notificationService.removeModal(id);
  }
}
