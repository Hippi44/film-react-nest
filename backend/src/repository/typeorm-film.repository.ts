import { DataSource, Repository } from 'typeorm';
import type { FilmDto, FilmSessionDto } from '../films/dto/films.dto';
import type { CreateOrderDto } from '../order/dto/order.dto';
import type { FilmsRepository, SeatReservationResult } from './film.repository';
import { FilmEntity } from './entities/film.entity';
import { ScheduleEntity } from './entities/schedule.entity';

export class TypeOrmFilmRepository implements FilmsRepository {
  constructor(
    private readonly films: Repository<FilmEntity>,
    private readonly schedules: Repository<ScheduleEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.films.find();
    return films.map((film) => this.toFilmDto(film));
  }

  async findById(id: string): Promise<FilmDto | null> {
    const film = await this.films
      .createQueryBuilder('film')
      .leftJoinAndSelect('film.schedule', 'schedule')
      .where('film.id = :id', { id })
      .orderBy('schedule.daytime', 'ASC')
      .getOne();

    if (!film) return null;

    return this.toFilmDto(
      film,
      (film.schedule ?? []).map((schedule) => this.toSessionDto(schedule)),
    );
  }

  async reserveSeats(
    tickets: CreateOrderDto[],
  ): Promise<SeatReservationResult> {
    return this.dataSource.transaction(async (manager) => {
      const schedules = manager.getRepository(ScheduleEntity);
      const films = manager.getRepository(FilmEntity);
      const lockedSchedules = new Map<string, ScheduleEntity>();

      for (const ticket of tickets) {
        const key = `${ticket.film}:${ticket.session}`;
        let schedule = lockedSchedules.get(key);

        if (!schedule) {
          schedule =
            (await schedules
              .createQueryBuilder('schedule')
              .innerJoin('schedule.film', 'film')
              .where('schedule.id = :session', { session: ticket.session })
              .andWhere('film.id = :film', { film: ticket.film })
              .setLock('pessimistic_write')
              .getOne()) ?? undefined;

          if (!schedule) {
            const film = await films.findOneBy({ id: ticket.film });
            return {
              success: false,
              reason: film ? 'session-not-found' : 'film-not-found',
            };
          }

          lockedSchedules.set(key, schedule);
        }

        const seat = `${ticket.row}:${ticket.seat}`;
        if (schedule.taken.includes(seat)) {
          return { success: false, reason: 'seat-taken' };
        }

        schedule.taken = [...schedule.taken, seat];
      }

      await schedules.save([...lockedSchedules.values()]);
      return { success: true };
    });
  }

  async releaseSeats(tickets: CreateOrderDto[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const schedules = manager.getRepository(ScheduleEntity);

      for (const ticket of tickets) {
        const schedule = await schedules
          .createQueryBuilder('schedule')
          .innerJoin('schedule.film', 'film')
          .where('schedule.id = :session', { session: ticket.session })
          .andWhere('film.id = :film', { film: ticket.film })
          .setLock('pessimistic_write')
          .getOne();

        if (!schedule) continue;

        const seat = `${ticket.row}:${ticket.seat}`;
        schedule.taken = schedule.taken.filter((item) => item !== seat);
        await schedules.save(schedule);
      }
    });
  }

  private toFilmDto(film: FilmEntity, schedule?: FilmSessionDto[]): FilmDto {
    const result: FilmDto = {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags ?? [],
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    };

    if (schedule !== undefined) result.schedule = schedule;
    return result;
  }

  private toSessionDto(schedule: ScheduleEntity): FilmSessionDto {
    return {
      id: schedule.id,
      daytime: schedule.daytime.toISOString(),
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken ?? [],
    };
  }
}
