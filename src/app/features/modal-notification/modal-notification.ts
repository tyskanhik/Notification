import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-modal-notification',
  standalone: true,
  imports: [],
  templateUrl: './modal-notification.html',
  styleUrl: './modal-notification.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalNotification {
  notification = input.required<Notification>();
  onClose = output<void>();
}
