import { Module } from '@nestjs/common';
import {
  getRepositoryToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { AppConfig } from '../app.config.provider';
import { SettingsModule } from '../config.module';
import { FILMS_REPOSITORY, ORDERS_REPOSITORY } from './repository.constants';
import type { FilmsRepository } from './film.repository';
import { FilmEntity } from './entities/film.entity';
import { OrderEntity } from './entities/order.entity';
import { ScheduleEntity } from './entities/schedule.entity';
import { MemoryFilmRepository } from './memory-film.repository';
import { MemoryOrdersRepository } from './memory-orders.repository';
import { TypeOrmFilmRepository } from './typeorm-film.repository';
import { TypeOrmOrdersRepository } from './typeorm-orders.repository';
import type { OrdersRepository } from './order.repository';

@Module({
  imports: [
    SettingsModule,
    TypeOrmModule.forRootAsync({
      imports: [SettingsModule],
      inject: ['CONFIG'],
      useFactory: (config: AppConfig): TypeOrmModuleOptions => ({
        type: 'postgres',
        url: config.database.url,
        username: config.database.username,
        password: config.database.password,
        entities: [FilmEntity, ScheduleEntity, OrderEntity],
        synchronize: config.database.driver === 'postgres',
        manualInitialization: config.database.driver === 'memory',
      }),
    }),
    TypeOrmModule.forFeature([FilmEntity, ScheduleEntity, OrderEntity]),
  ],
  providers: [
    {
      provide: FILMS_REPOSITORY,
      inject: [
        getRepositoryToken(FilmEntity),
        getRepositoryToken(ScheduleEntity),
        DataSource,
        'CONFIG',
      ],
      useFactory: async (
        films: Repository<FilmEntity>,
        schedules: Repository<ScheduleEntity>,
        dataSource: DataSource,
        config: AppConfig,
      ): Promise<FilmsRepository> => {
        if (config.database.driver === 'memory') {
          return new MemoryFilmRepository();
        }
        return new TypeOrmFilmRepository(films, schedules, dataSource);
      },
    },
    {
      provide: ORDERS_REPOSITORY,
      inject: [getRepositoryToken(OrderEntity), 'CONFIG'],
      useFactory: (
        orders: Repository<OrderEntity>,
        config: AppConfig,
      ): OrdersRepository => {
        if (config.database.driver === 'memory') {
          return new MemoryOrdersRepository();
        }
        return new TypeOrmOrdersRepository(orders);
      },
    },
  ],
  exports: [FILMS_REPOSITORY, ORDERS_REPOSITORY],
})
export class RepositoryModule {}
