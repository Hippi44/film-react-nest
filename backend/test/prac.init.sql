CREATE TABLE IF NOT EXISTS films (
  id uuid PRIMARY KEY,
  rating double precision,
  director text,
  tags text[] NOT NULL DEFAULT '{}',
  title text,
  about text,
  description text,
  image text,
  cover text
);

CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY,
  daytime timestamptz NOT NULL,
  hall integer NOT NULL,
  "rows" integer NOT NULL,
  seats integer NOT NULL,
  price integer NOT NULL,
  taken text[] NOT NULL DEFAULT '{}',
  film_id uuid NOT NULL REFERENCES films(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY,
  film uuid NOT NULL,
  session uuid NOT NULL,
  daytime timestamptz NOT NULL,
  "row" integer NOT NULL,
  seat integer NOT NULL,
  price integer NOT NULL,
  email text,
  phone text
);
