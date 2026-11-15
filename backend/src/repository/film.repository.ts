import type { CreateOrderDto } from '../order/dto/order.dto';
import type { FilmDto } from '../films/dto/films.dto';

export interface FilmRepository {
  findAll(): Promise<FilmDto[]>;
  findById(id: string): Promise<FilmDto>;
  reserveSeats(tickets: CreateOrderDto[]): Promise<void>;
  releaseSeats(tickets: CreateOrderDto[]): Promise<void>;
}
