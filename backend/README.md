# Бэкенд

Установите PostgreSQL и создайте базу данных `films` и пользователя для неё. Затем установите зависимости и запустите сервер:

```text
npm ci
Copy-Item .env.example .env
npm run start:dev
```

Настройки подключения находятся в `.env`. SQL-файлы для создания таблиц и загрузки данных находятся в `test`:

```text
psql -U films -d films -f test/prac.init.sql
psql -U films -d films -f test/prac.films.sql
psql -U films -d films -f test/prac.shedules.sql
```

TypeORM создаёт таблицы при запуске. Постеры доступны по пути `/content/afisha/`.
