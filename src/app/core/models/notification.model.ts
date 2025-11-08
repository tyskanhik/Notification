export const NotificationType = {
  SUCCESS: 'success',
  WARNING: 'warning', 
  ERROR: 'error'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  groupKey?: string;
}

export function createNotification(
  type: NotificationType, 
  title: string, 
  message: string, 
  duration?: number,
  groupKey?: string
): Notification {
  return {
    id: Math.random().toString(36).substring(2, 9),
    type,
    title,
    message,
    duration,
    groupKey
  };
}

export type DeliveryChannel = 'toast' | 'modal' | 'alert';

export interface DeliveryOptions {
  delayed?: number;
  grouped?: boolean;
  groupKey?: string;
  duration?: number;
}