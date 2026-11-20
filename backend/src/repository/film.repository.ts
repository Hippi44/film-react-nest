import type { CreateOrderDto } from '../order/dto/order.dto';
import type { FilmDto } from '../films/dto/films.dto';

export interface FilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findById(id: string): Promise<FilmDto | null>;
  reserveSeats(tickets: CreateOrderDto[]): Promise<SeatReservationResult>;
  releaseSeats(tickets: CreateOrderDto[]): Promise<void>;
}

export type SeatReservationResult =
  | { success: true }
  | {
      success: false;
      reason: 'film-not-found' | 'session-not-found' | 'seat-taken';
    };

export type FilmRepository = FilmsRepository;
