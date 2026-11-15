# Бэкенд

Установите зависимости и запустите сервер:

```text
npm ci
Copy-Item .env.example .env
npm run start:dev
```

Сервер использует порт 3000. Параметры MongoDB и порта находятся в `.env`.
Перед первым запуском с MongoDB загрузите фильмы из `test/mongodb_initial_stub.json`:

```text
mongoimport --uri mongodb://localhost:27017/prac --collection films --jsonArray --file test/mongodb_initial_stub.json
```

По умолчанию без `.env` используется память. Постеры доступны по пути
`/content/afisha/`.
