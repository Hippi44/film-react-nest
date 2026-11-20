import { BadRequestException, NotFoundException } from '@nestjs/common';
import mongoose = require('mongoose');
import type { FilmDto, FilmSessionDto } from '../films/dto/films.dto';
import type { CreateOrderDto } from '../order/dto/order.dto';
import type { FilmRepository } from './film.repository';

type FilmRecord = Omit<FilmDto, 'schedule'> & {
  schedule?: FilmSessionDto[];
};

export class MongoFilmRepository implements FilmRepository {
  private readonly films: mongoose.Model<FilmRecord>;

  constructor(connection: mongoose.Connection) {
    const sessionSchema = new mongoose.Schema(
      {
        id: { type: String, required: true },
        daytime: { type: String, required: true },
        hall: mongoose.Schema.Types.Mixed,
        rows: { type: Number, required: true },
        seats: { type: Number, required: true },
        price: { type: Number, required: true },
        taken: { type: [String], default: [] },
      },
      { _id: false, id: false },
    );

    const filmSchema = new mongoose.Schema<FilmRecord>(
      {
        id: { type: String, required: true, unique: true, index: true },
        rating: Number,
        director: String,
        tags: [String],
        title: String,
        about: String,
        description: String,
        image: String,
        cover: String,
        schedule: { type: [sessionSchema], default: [] },
      },
      { versionKey: false, id: false },
    );

    this.films =
      (connection.models.Film as mongoose.Model<FilmRecord> | undefined) ??
      connection.model<FilmRecord>('Film', filmSchema, 'films');
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.films
      .find({}, { _id: 0, schedule: 0 })
      .lean()
      .exec();

    return films.map((film) => ({
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    }));
  }

  async findById(id: string): Promise<FilmDto> {
    const film = await this.films.findOne({ id }, { _id: 0 }).lean().exec();
    if (!film) throw new NotFoundException('Film not found');

    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
      schedule: (film.schedule ?? []).map((session) => ({
        ...session,
        taken: session.taken ?? [],
      })),
    };
  }

  async reserveSeats(tickets: CreateOrderDto[]): Promise<void> {
    const reserved: CreateOrderDto[] = [];

    try {
      for (const ticket of tickets) {
        const seat = ticket.row + ':' + ticket.seat;
        const updated = await this.films
          .findOneAndUpdate(
            {
              id: ticket.film,
              schedule: {
                $elemMatch: {
                  id: ticket.session,
                  taken: { $ne: seat },
                },
              },
            },
            { $addToSet: { 'schedule.$.taken': seat } },
            { new: true, projection: { _id: 1 } },
          )
          .lean()
          .exec();

        if (!updated) {
          const film = (await this.films
            .findOne({ id: ticket.film }, { schedule: 1 })
            .lean()
            .exec()) as { _id: unknown; schedule: FilmSessionDto[] } | null;

          if (!film) throw new NotFoundException('Film not found');
          const session = ((film.schedule ?? []) as FilmSessionDto[]).find(
            (item) => item.id === ticket.session,
          );
          if (!session) throw new NotFoundException('Session not found');
          throw new BadRequestException('Seat is already taken');
        }

        reserved.push(ticket);
      }
    } catch (error) {
      await this.releaseSeats(reserved);
      throw error;
    }
  }

  async releaseSeats(tickets: CreateOrderDto[]): Promise<void> {
    for (const ticket of tickets) {
      const seat = ticket.row + ':' + ticket.seat;
      await this.films
        .updateOne(
          {
            id: ticket.film,
            schedule: {
              $elemMatch: { id: ticket.session, taken: seat },
            },
          },
          { $pull: { 'schedule.$.taken': seat } },
        )
        .exec();
    }
  }
}
