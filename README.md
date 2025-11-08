# 🔔 Angular Notification

Современная система уведомлений для Angular приложений с поддержкой различных каналов доставки и группировкой сообщений.

## 🚀 Возможности

- **📨 Множественные каналы доставки**: Toast, Modal, Alert
- **👥 Умная группировка**: Объединение одинаковых toast уведомлений
- **⏰ Гибкое время показа**: Настраиваемая длительность и задержки
- **🎨 Разные типы уведомлений**: Success, Warning, Error
- **⚡ Modern Angular**: Signals, Standalone Components, OnPush стратегия

## 🏗️ Архитектура

### Структура проекта

```text
src/
├── core/
│ ├── models/
│ │ └── notification.model.ts # Модели и типы
│ └── services/
│ ├── notification.service.ts # Основной сервис (стратегия)
│ ├── notification-factory.service.ts # Фабрика уведомлений
│ └── delayed-delivery.service.ts # Декоратор доставка
├── features/
│ └── notification-container/
│ ├── toast-notification/
│ └── modal-notification/
└── app.component.ts # Демо-компонент
```

## 🛠️ Установка и запуск

Клонирование репозитория
```bash
git clone <https://github.com/tyskanhik/Notification>
cd notification
```

Установка зависимостей
```bash
npm install
```

Запуск development сервера
```bash
ng serve
```

Открыть в браузере
```text
http://localhost:4200
```