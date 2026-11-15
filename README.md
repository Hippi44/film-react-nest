# FILM!

В проекте есть API на NestJS и интерфейс на React.

## MongoDB

Запустите MongoDB. Перед первым запуском API загрузите данные из папки `backend`:

```text
mongoimport --uri mongodb://localhost:27017/prac --collection films --jsonArray --file test/mongodb_initial_stub.json
```

Команду нужно выполнить один раз для пустой базы.

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
