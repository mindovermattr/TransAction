# Transaction Tracker

Веб-приложение для учета личных финансов: отслеживание расходов, доходов и финансового анализа.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.9-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## Описание

Transaction Tracker - это современное веб-приложение для управления личными финансами. Позволяет пользователям:

- Отслеживать расходы по категориям (Развлечения, Транспорт, Еда, Образование, Жилье, Другое)
- Учитывать доходы
- Анализировать финансовые данные с визуализацией
- Безопасно хранить данные с защищенной аутентификацией
- Работать с современным адаптивным интерфейсом

## Архитектура проекта

Проект организован как монорепозиторий с разделением на клиентскую и серверную части:

```
todoist/
├── client/          # Frontend (React + TypeScript)
├── server/          # Backend (Express + TypeScript)
└── package.json     # Общие скрипты и зависимости
```

## Установка

1. **Клонируйте репозиторий:**

```bash
git clone <repository-url>
cd todoist
```

2. **Установите зависимости для всего проекта:**

```bash
pnpm install
```

3. **Настройте Backend:**

Перейдите в папку `server/` и следуйте инструкции в README.md:

4. **Запустите Backend:**

```bash
# В папке server/
pnpm dev
```

5. **Запустите Frontend:**

```bash
# В новой консоли, в папке client/
cd client
pnpm dev
```

6. **Откройте браузер:**

- Frontend: http://localhost:5173 (или другой порт, указанный Vite)
- Backend API: http://localhost:3000

## Основные функции

### Управление транзакциями

- Добавление расходов с категориями
- Просмотр истории транзакций
- Пагинация для больших списков
- Фильтрация по категориям
- Редактирование и удаление транзакций

### Управление доходами

- Добавление доходов
- Просмотр истории доходов

### Аналитика

- Визуализация расходов по категориям
- Сводка доходов и расходов
- Графики и диаграммы

### UI/UX

- Современный адаптивный дизайн
- Темная и светлая темы
- Боковая панель навигации
- Модальные окна для форм
- Таблицы с сортировкой

## Безопасность

- Пароли хешируются с помощью Argon2
- JWT токены для аутентификации
- Валидация всех входных данных
