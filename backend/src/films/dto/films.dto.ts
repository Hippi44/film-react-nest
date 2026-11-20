export class FilmSessionDto {
  id!: string;
  daytime!: string;
  hall!: number | string;
  rows!: number;
  seats!: number;
  price!: number;
  taken!: string[];
}

export class FilmDto {
  id!: string;
  rating!: number;
  director!: string;
  tags!: string[];
  title!: string;
  about!: string;
  description!: string;
  image!: string;
  cover!: string;
  schedule?: FilmSessionDto[];
}

export class FilmsResponseDto {
  total!: number;
  items!: FilmDto[];
}

export class FilmScheduleResponseDto {
  total!: number;
  items!: FilmSessionDto[];
}
