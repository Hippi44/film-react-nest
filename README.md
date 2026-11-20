# FILM!

В проекте есть API на NestJS и интерфейс на React.

## PostgreSQL

Создайте базу данных `films` и пользователя с учётными данными из `backend/.env.example`. TypeORM создаёт таблицы при запуске API.

## Backend

```text
cd backend
npm ci
Copy-Item .env.example .env
npm run start:dev
```

## Frontend

```text
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```
