import { Inject, Injectable } from '@nestjs/common';
import type {
  FilmScheduleResponseDto,
  FilmsResponseDto,
} from './dto/films.dto';
import type { FilmRepository } from '../repository/film.repository';
import { FILMS_REPOSITORY } from '../repository/repository.constants';

@Injectable()
export class FilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly repository: FilmRepository,
  ) {}

  async findAll(): Promise<FilmsResponseDto> {
    const items = await this.repository.findAll();
    return { total: items.length, items };
  }

  async findById(id: string): Promise<FilmScheduleResponseDto> {
    const film = await this.repository.findById(id);
    const items = film.schedule ?? [];
    return { total: items.length, items };
  }
}
