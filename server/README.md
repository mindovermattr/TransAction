# TransAction Server

Backend API для приложения `TransAction`: авторизация, счета, переводы, расходы, доходы, бюджеты, аналитика и данные для дашборда.

<p>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6.9-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-13+-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
</p>

## Возможности

- JWT-аутентификация через Passport.
- Хеширование паролей через Argon2.
- CRUD для счетов, расходов, доходов и бюджетов.
- Переводы между счетами с учетом входящих и исходящих сумм.
- Агрегации для дашборда и аналитики.
- Валидация входных данных через DTO.
- Централизованный формат ошибок.
- Prisma migrations и seed-данные для локальной разработки.

## Стек

| Зона | Технологии |
| --- | --- |
| Runtime | Node.js, TypeScript |
| API | Express 5, Passport, passport-jwt |
| Database | PostgreSQL, Prisma ORM, Prisma Accelerate extension |
| Validation | class-validator, class-transformer |
| Security | Argon2, JWT, Helmet, CORS, express-rate-limit |
| Tooling | nodemon, ts-node, Prisma CLI |

## Архитектура

- API разбит по доменам: `auth`, `users`, `accounts`, `transfers`, `transactions`, `income`, `analytics`, `dashboard`, `budgets`.
- Каждый домен имеет controller для HTTP-слоя и service для бизнес-логики. Контроллеры не работают с Prisma напрямую.
- DTO находятся в `models/**` и валидируются middleware `dtoValidation`. После успешной проверки данные доступны как `req.validatedBody`.
- Общие правила валидации запроса вынесены в middleware: проверка пустого body и преобразование plain object в DTO-класс через `class-transformer`.
- Ошибки проходят через `HttpException` и единый `errorHandler`, который возвращает стабильный JSON-формат: `code`, `message`, `details`.
- Все приватные роуты подключаются через `jwtAuthMiddleware`; публичным остается только `/auth` и `/health`.
- JWT strategy достает пользователя из базы и убирает `password` перед записью в `req.user`.
- Prisma-клиент создается в одном месте (`src/prisma.ts`) и расширяется через `withAccelerate`.
- Prisma schema описывает основные сущности финансового домена: `User`, `Account`, `Transfer`, `Transaction`, `Income`, `Budget`.
- Seed создает тестового пользователя, счета, транзакции, доходы, переводы и бюджеты для текущего и предыдущего месяца.

## API-модули

```text
GET  /health

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

`/auth` защищен rate limiter: 100 запросов за 15 минут. Остальные доменные роуты требуют `Authorization: Bearer <token>`.

## Быстрый старт

### 1. Установить зависимости

```bash
pnpm install
```

### 2. Создать `.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/transaction"
JWT_SECRET="change-me"
PORT=3000
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

`PORT`, `JWT_EXPIRES_IN` и `CORS_ORIGIN` можно не задавать: для них есть значения по умолчанию.

### 3. Подготовить базу

```bash
pnpm dlx prisma migrate dev
pnpm seed
```

После `seed` доступен тестовый пользователь:

```text
email: test@test.com
password: 123456
```

### 4. Запустить API

```bash
pnpm dev
```

API будет доступно на `http://localhost:3000`, healthcheck — на `http://localhost:3000/health`.

## Скрипты

| Команда | Назначение |
| --- | --- |
| `pnpm dev` | запуск API через nodemon |
| `pnpm seed` | заполнение базы демо-данными |
