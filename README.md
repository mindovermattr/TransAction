<div align="center">
  <img src="./client/public/logo.svg" alt="TransAction logo" width="80" height="80" />

  <h1>TransAction</h1>

  <p>
    Персональный финансовый трекер: счета, расходы, доходы, бюджеты, аналитика и подписки в одном приложении.
  </p>

  <p>
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" />
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
    <img alt="Express" src="https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express&logoColor=white" />
    <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6.9-2D3748?style=flat-square&logo=prisma&logoColor=white" />
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-13+-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  </p>
</div>

## О проекте

`TransAction` — fullstack-приложение для учета личных финансов на современном TypeScript-стеке. Проект объединяет клиентский интерфейс, серверное API, PostgreSQL, авторизацию, графики и несколько связанных финансовых сущностей.

## Возможности

- Регистрация, вход и защищенные маршруты по JWT.
- Счета разных типов: cash, debit, savings, credit.
- Переводы между счетами с пересчетом балансов.
- Учет расходов и доходов с датами, категориями и привязкой к счетам.
- Дашборд с общей сводкой, cashflow, топ-категориями и последней активностью.
- Аналитика по категориям, динамике расходов и дням недели.
- Месячные бюджеты по категориям с прогрессом, остатком и предупреждениями.
- Подписки и регулярные списания с ближайшими платежами и demo-режимом.
- Адаптивный интерфейс со светлой и темной темой.

## Стек

| Часть | Технологии |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, TanStack Query, TanStack Table |
| UI | Tailwind CSS 4, Radix UI, shadcn/ui, Lucide, Recharts |
| Forms | React Hook Form, Zod |
| Backend | Express 5, TypeScript, Passport JWT, Helmet, CORS |
| Database | PostgreSQL, Prisma ORM, Prisma Migrations |
| Auth | JWT, Argon2 |

## Структура

```text
TransAction/
├── client/          # React-приложение
├── server/          # Express API, Prisma schema, migrations, seed
├── package.json     # Husky/pre-commit на уровне репозитория
└── README.md
```

Корневой `package.json` не запускает весь проект целиком: зависимости и рабочие команды находятся отдельно в `client/` и `server/`.

## Быстрый старт

### 1. Установить зависимости

```bash
cd server
pnpm install

cd ../client
pnpm install
```

### 2. Создать `server/.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/transaction"
JWT_SECRET="change-me"
PORT=3000
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

`PORT`, `JWT_EXPIRES_IN` и `CORS_ORIGIN` можно не задавать: для них есть значения по умолчанию.

### 3. Настроить базу

```bash
cd server
pnpm dlx prisma migrate dev
pnpm seed
```

После `seed` можно войти под тестовым пользователем:

```text
email: test@test.com
password: 123456
```

### 4. Запустить backend

```bash
cd server
pnpm dev
```

API будет доступно на `http://localhost:3000`, healthcheck — на `http://localhost:3000/health`.

### 5. Запустить frontend

```bash
cd client
pnpm dev
```

Клиент будет доступен на `http://localhost:5173`.

Если API запущено не на `http://localhost:3000`, создай `client/.env`:

```env
VITE_API_URL="http://localhost:3000"
```

## Скрипты

| Где | Команда | Назначение |
| --- | --- | --- |
| `client/` | `pnpm dev` | dev-сервер Vite |
| `client/` | `pnpm build` | production-сборка |
| `client/` | `pnpm lint` | проверка ESLint |
| `client/` | `pnpm preview` | preview production-сборки |
| `server/` | `pnpm dev` | запуск API через nodemon |
| `server/` | `pnpm seed` | заполнение базы демо-данными |

## API-модули

Основные серверные роуты:

```text
/auth
/users
/accounts
/transfers
/transactions
/income
/analytics
/dashboard
/budgets
```
