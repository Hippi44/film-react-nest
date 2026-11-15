import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { FilmRepository } from '../repository/film.repository';
import type {
  OrderContacts,
  OrdersRepository,
} from '../repository/order.repository';
import {
  FILMS_REPOSITORY,
  ORDERS_REPOSITORY,
} from '../repository/repository.constants';
import {
  CreateOrderDto,
  OrderDto,
  OrderRequestDto,
  OrdersResponseDto,
} from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(FILMS_REPOSITORY) private readonly films: FilmRepository,
    @Inject(ORDERS_REPOSITORY) private readonly orders: OrdersRepository,
  ) {}

  async create(
    request: OrderRequestDto | CreateOrderDto[],
  ): Promise<OrdersResponseDto> {
    const { tickets, contacts } = this.normalize(request);
    const items: OrderDto[] = [];
    const requestedSeats = new Set<string>();

    for (const ticket of tickets) {
      if (
        typeof ticket.film !== 'string' ||
        typeof ticket.session !== 'string' ||
        !Number.isInteger(ticket.row) ||
        !Number.isInteger(ticket.seat) ||
        ticket.row < 1 ||
        ticket.seat < 1
      ) {
        throw new BadRequestException('Invalid ticket');
      }

      const film = await this.films.findById(ticket.film);
      const session = film.schedule?.find((item) => item.id === ticket.session);
      if (!session) throw new NotFoundException('Session not found');
      if (ticket.row > session.rows || ticket.seat > session.seats) {
        throw new BadRequestException('Seat is outside the auditorium');
      }

      const seatKey =
        ticket.film +
        ':' +
        ticket.session +
        ':' +
        ticket.row +
        ':' +
        ticket.seat;
      if (requestedSeats.has(seatKey)) {
        throw new BadRequestException('Seat is already taken');
      }
      requestedSeats.add(seatKey);

      items.push({
        film: ticket.film,
        session: ticket.session,
        daytime: session.daytime,
        row: ticket.row,
        seat: ticket.seat,
        price: session.price,
        id: randomUUID(),
      });
    }

    await this.films.reserveSeats(tickets);

    try {
      await this.orders.save(items, contacts);
    } catch (error) {
      await this.films.releaseSeats(tickets);
      throw error;
    }

    return { total: items.length, items };
  }

  private normalize(request: unknown): {
    tickets: CreateOrderDto[];
    contacts: OrderContacts;
  } {
    const wrapped =
      request !== null && typeof request === 'object' && !Array.isArray(request)
        ? (request as OrderRequestDto)
        : undefined;
    const tickets = Array.isArray(request) ? request : wrapped?.tickets;

    if (!Array.isArray(tickets) || tickets.length === 0) {
      throw new BadRequestException('At least one seat must be selected');
    }

    if (tickets.some((ticket) => !ticket || typeof ticket !== 'object')) {
      throw new BadRequestException('Invalid ticket');
    }

    return {
      tickets,
      contacts: {
        email: typeof wrapped?.email === 'string' ? wrapped.email : undefined,
        phone: typeof wrapped?.phone === 'string' ? wrapped.phone : undefined,
      },
    };
  }
}
