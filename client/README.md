# TransAction Client

Frontend-часть приложения `TransAction`: личный финансовый кабинет для работы со счетами, расходами, доходами, бюджетами, аналитикой и подписками.

<p>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
</p>

## Возможности

- Авторизация и защищенные маршруты.
- Дашборд с финансовой сводкой, графиками и последней активностью.
- Страницы расходов, доходов, счетов, аналитики, бюджетов и подписок.
- Работа с серверным состоянием через TanStack Query.
- Таблицы, формы, модальные окна и валидация данных через Zod.
- Адаптивный интерфейс со светлой и темной темой.

## Стек

| Зона | Технологии |
| --- | --- |
| Core | React 19, TypeScript, Vite 7 |
| Routing | React Router 7 |
| Data fetching | TanStack Query, ofetch |
| UI | Tailwind CSS 4, Radix UI, shadcn/ui, Lucide |
| Tables and charts | TanStack Table, Recharts |
| Forms | React Hook Form, Zod |
| Tooling | ESLint, Prettier, lint-staged |

## Архитектура

- API-слой зеркалирует backend-домены: `accounts`, `budgets`, `dashboard`, `income`, `transactions`, `analytics`, `auth`.
- Для каждого домена низкоуровневые HTTP-функции лежат в `api/requests`, а React Query-обертки — в `api/hooks`.
- Внутри `api/requests` и `api/hooks` используются barrel exports. Страницы импортируют публичный API модуля, а не конкретные файлы реализации.
- Общие типы API-клиента вынесены в `api/index.d.ts`: `ApiRequestConfig`, `OfetchRequestConfig`, `QuerySettings`, `MutationSettings`, `InfiniteQuerySettings`.
- `requests` не зависят от React и отвечают только за вызов backend endpoint через `ofetch`.
- `hooks` добавляют query keys, настройки TanStack Query и mutation/query lifecycle поверх `requests`.
- Zod-схемы вынесены в `schemas`, чтобы формы и ответы API валидировались одним набором контрактов.
- Page modules держат локальные `ui`, `lib`, `types` и `hooks` рядом со страницей, если они не являются общими для всего приложения.

## Быстрый старт

```bash
pnpm install
pnpm dev
```

Клиент по умолчанию доступен на `http://localhost:5173`.

Для полноценной работы нужен запущенный backend из `../server`. По умолчанию клиент обращается к API на `http://localhost:3000`.

Если backend работает на другом адресе, создай `client/.env`:

```env
VITE_API_URL="http://localhost:3000"
```

## Скрипты

| Команда | Назначение |
| --- | --- |
| `pnpm dev` | запуск dev-сервера Vite |
| `pnpm build` | TypeScript-проверка и production-сборка |
| `pnpm lint` | проверка ESLint |
| `pnpm preview` | preview production-сборки |
