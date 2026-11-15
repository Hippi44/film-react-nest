import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as request from 'supertest';
import { ApiExceptionFilter } from './../src/api-exception.filter';

type FilmListResponse = {
  total: number;
  items: Array<{ id: string; schedule?: unknown }>;
};

type ScheduleResponse = {
  total: number;
  items: Array<{ id: string; taken: string[] }>;
};

type OrderResponse = {
  total: number;
  items: Array<{ id: string }>;
};

describe('Film API (e2e)', () => {
  let app!: INestApplication;
  const originalEnvironment = {
    DATABASE_DRIVER: process.env.DATABASE_DRIVER,
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT,
  };

  beforeAll(async () => {
    process.env.DATABASE_DRIVER = 'memory';
    process.env.DATABASE_URL = '';
    process.env.PORT = '3000';

    const { AppModule } = await import('./../src/app.module');
    app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('api/afisha');
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('returns films and their schedules', async () => {
    const films = await request(app.getHttpServer())
      .get('/api/afisha/films')
      .expect(200)
      .then((response) => response.body as FilmListResponse);
    const film = films.items[0];

    expect(films.total).toBeGreaterThan(0);
    expect(film.schedule).toBeUndefined();

    const schedule = await request(app.getHttpServer())
      .get(`/api/afisha/films/${film.id}/schedule`)
      .expect(200)
      .then((response) => response.body as ScheduleResponse);

    expect(schedule.total).toBeGreaterThan(0);
    expect(schedule.items[0]).toHaveProperty('taken');
  });

  it('saves a booking and rejects the same seat twice', async () => {
    const films = await request(app.getHttpServer())
      .get('/api/afisha/films')
      .expect(200)
      .then((response) => response.body as FilmListResponse);
    const film = films.items[0];
    const schedule = await request(app.getHttpServer())
      .get(`/api/afisha/films/${film.id}/schedule`)
      .expect(200)
      .then((response) => response.body as ScheduleResponse);
    const session = schedule.items[0];
    const order = {
      email: 'test@example.com',
      phone: '+7 (000) 000-00-00',
      tickets: [{ film: film.id, session: session.id, row: 1, seat: 1 }],
    };

    const created = await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(order)
      .expect(200)
      .then((response) => response.body as OrderResponse);

    expect(created.total).toBe(1);
    expect(created.items[0]).toHaveProperty('id');

    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(order)
      .expect(400);

    const updatedSchedule = await request(app.getHttpServer())
      .get(`/api/afisha/films/${film.id}/schedule`)
      .expect(200)
      .then((response) => response.body as ScheduleResponse);

    expect(updatedSchedule.items[0].taken).toContain('1:1');
  });

  it('serves poster files', async () => {
    await request(app.getHttpServer())
      .get('/content/afisha/bg1c.jpg')
      .expect(200)
      .expect('Content-Type', /image\/jpeg/);
  });
});
