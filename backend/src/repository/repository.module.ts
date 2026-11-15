import { Module } from '@nestjs/common';
import type { AppConfig } from '../app.config.provider';
import { SettingsModule } from '../config.module';
import { FILMS_REPOSITORY, ORDERS_REPOSITORY } from './repository.constants';
import type { FilmRepository } from './film.repository';
import { MemoryFilmRepository } from './memory-film.repository';
import { MemoryOrdersRepository } from './memory-orders.repository';
import { MongoConnectionService } from './mongo-connection.service';
import { MongoFilmRepository } from './mongo-film.repository';
import { MongoOrdersRepository } from './mongo-orders.repository';
import type { OrdersRepository } from './order.repository';

@Module({
  imports: [SettingsModule],
  providers: [
    MongoConnectionService,
    {
      provide: FILMS_REPOSITORY,
      inject: [MongoConnectionService, 'CONFIG'],
      useFactory: async (
        mongo: MongoConnectionService,
        config: AppConfig,
      ): Promise<FilmRepository> => {
        if (config.database.driver === 'memory') {
          return new MemoryFilmRepository();
        }
        return new MongoFilmRepository(await mongo.getConnection());
      },
    },
    {
      provide: ORDERS_REPOSITORY,
      inject: [MongoConnectionService, 'CONFIG'],
      useFactory: async (
        mongo: MongoConnectionService,
        config: AppConfig,
      ): Promise<OrdersRepository> => {
        if (config.database.driver === 'memory') {
          return new MemoryOrdersRepository();
        }
        return new MongoOrdersRepository(await mongo.getConnection());
      },
    },
  ],
  exports: [FILMS_REPOSITORY, ORDERS_REPOSITORY],
})
export class RepositoryModule {}
