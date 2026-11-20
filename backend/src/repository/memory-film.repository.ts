import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import type { FilmDto } from '../films/dto/films.dto';
import type { CreateOrderDto } from '../order/dto/order.dto';
import type { FilmsRepository, SeatReservationResult } from './film.repository';

@Injectable()
export class MemoryFilmRepository implements FilmsRepository {
  private readonly films: FilmDto[];

  constructor() {
    const seedPath = path.resolve(__dirname, '../../test/films.stub.json');
    const seed = JSON.parse(readFileSync(seedPath, 'utf8')) as FilmDto[];

    this.films = seed.map((film) => ({
      ...film,
      tags: [...(film.tags ?? [])],
      schedule: (film.schedule ?? []).map((session) => ({
        ...session,
        taken: [...(session.taken ?? [])],
      })),
    }));
  }

  async findAll(): Promise<FilmDto[]> {
    return this.films.map((film) => {
      const result = { ...film, tags: [...film.tags] };
      delete result.schedule;
      return result;
    });
  }

  async findById(id: string): Promise<FilmDto | null> {
    const film = this.films.find((item) => item.id === id);
    if (!film) return null;

    return {
      ...film,
      tags: [...film.tags],
      schedule: film.schedule?.map((session) => ({
        ...session,
        taken: [...session.taken],
      })),
    };
  }

  async reserveSeats(
    tickets: CreateOrderDto[],
  ): Promise<SeatReservationResult> {
    const pending: Array<{
      session: NonNullable<FilmDto['schedule']>[number];
      seat: string;
    }> = [];
    const requested = new Set<string>();

    for (const ticket of tickets) {
      const film = this.films.find((item) => item.id === ticket.film);
      if (!film) return { success: false, reason: 'film-not-found' };

      const session = film.schedule?.find((item) => item.id === ticket.session);
      if (!session) return { success: false, reason: 'session-not-found' };

      const seat = ticket.row + ':' + ticket.seat;
      const key = ticket.film + ':' + ticket.session + ':' + seat;
      if (session.taken.includes(seat) || requested.has(key)) {
        return { success: false, reason: 'seat-taken' };
      }

      requested.add(key);
      pending.push({ session, seat });
    }

    for (const { session, seat } of pending) {
      session.taken.push(seat);
    }

    return { success: true };
  }

  async releaseSeats(tickets: CreateOrderDto[]): Promise<void> {
    for (const ticket of tickets) {
      const session = this.films
        .find((item) => item.id === ticket.film)
        ?.schedule?.find((item) => item.id === ticket.session);
      const seat = ticket.row + ':' + ticket.seat;

      if (session) {
        session.taken = session.taken.filter((item) => item !== seat);
      }
    }
  }
}
