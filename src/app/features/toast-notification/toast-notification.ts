import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [],
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastNotification {
  notification = input.required<Notification>();
  onClose = output<void>();
}
